import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';

import { Alert, Spin } from 'antd';
import { useSearchParams } from 'react-router-dom';

import { useGetEssayQuery } from '../features/essay/essayApi';
import {
    useEssayAutoSave,
    useEssaySendMessage,
    useEssayValidation,
} from '../features/essay/hooks';
import { ViewSwitcher } from '../features/map/components/viewSwitcher';
import { useMapEventNotifier } from '../features/map/events';
import {
    useChatState,
    useFeedback,
    useFeedbackQueue,
    useMapAutoSave,
    useMapNodes,
    useMapSendMessage,
} from '../features/map/hooks';
import { useGetMapQuery } from '../features/map/utils';
import { useGetMeQuery } from '../features/user/userApi';
import { useUserActionTracker } from '../features/userAction/hooks';
import { useHeaderContext } from '../shared/HeaderContext';

import { ArticlePageContent } from './ArticlePageContent';
import { EssayPageContent } from './EssayPageContent';
import { MapPageContent } from './MapPageContent';

export const MapPage = () => {
    const [searchParams] = useSearchParams();
    const mapId = searchParams.get('mapId');
    const view = searchParams.get('view') || 'article';

    const { setHeaderContent } = useHeaderContext();
    const { trackAction } = useUserActionTracker();

    const { data: currentUser } = useGetMeQuery();
    const isFeedbackEnabled = currentUser?.lab?.group === 'active';

    // 頁面瀏覽追蹤
    useEffect(() => {
        const startTime = Date.now();

        // 記錄頁面停留開始
        trackAction('page_view_start', { view }, mapId ? parseInt(mapId, 10) : null);

        // 頁面離開時記錄停留時間
        const handleBeforeUnload = () => {
            const duration = Math.floor((Date.now() - startTime) / 1000);
            // 使用 sendBeacon 確保在頁面關閉前發送
            navigator.sendBeacon(
                '/api/user-action/',
                JSON.stringify({
                    action_type: 'page_view_end',
                    map_id: mapId ? parseInt(mapId, 10) : null,
                    metadata: { view, duration },
                }),
            );
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            // 組件卸載時記錄
            const duration = Math.floor((Date.now() - startTime) / 1000);
            trackAction('page_view_end', { view, duration }, mapId ? parseInt(mapId, 10) : null);

            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [view, mapId, trackAction]);

    // ==================== MindMap 相關邏輯 ====================
    const {
        data: mapData,
        isLoading: isMapLoading,
        error: mapError,
    } = useGetMapQuery(mapId, { skip: !mapId });
    const mapContext = useMapNodes(mapData);

    // 設定 Header 內容為 ViewSwitcher
    useEffect(() => {
        const taskName = mapData?.template?.name;
        setHeaderContent(<ViewSwitcher taskName={taskName} />);

        // 清理函數：當組件卸載時清空 Header 內容
        return () => setHeaderContent(null);
    }, [setHeaderContent, mapData]);

    const handleMapAutoSave = useMapAutoSave(mapId, mapContext.nodes, mapContext.edges);

    const feedbackQueue = useFeedbackQueue(mapId, handleMapAutoSave);
    const { addOperation, alerts, setAlerts } = feedbackQueue;

    const { isChatOpen, setIsChatOpen } = useChatState();
    const { feedbackData, setFeedbackData, handleCloseFeedback } = useFeedback();
    const {
        isSending: isMapSending,
        handleSendMessage: sendMapMessage,
    } = useMapSendMessage(mapId, handleMapAutoSave);

    // 包裝 sendMessage 來處理 feedback
    const handleSendMessage = useCallback(
        async (text) => {
            if (!text.trim()) return;

            const messageToSend = feedbackData
                ? `Student Operations:\n${feedbackData.message}\nFeedback from Assistant:\n${feedbackData.description}\nStudent Question:\n${text}`
                : text;

            // 立即關閉 feedback
            if (feedbackData) {
                setFeedbackData(null);
            }

            await sendMapMessage(messageToSend);
        },
        [feedbackData, sendMapMessage, setFeedbackData],
    );

    // 處理 Ask 按鈕點擊
    const handleAskClick = useCallback(
        (message, description, feedbackId = null) => {
            setFeedbackData({ message, description });
            setIsChatOpen(true);

            // 記錄點擊 Feedback Ask 按鈕
            if (feedbackId) {
                trackAction(
                    'click_feedback_ask',
                    { feedback_id: feedbackId },
                    mapId ? parseInt(mapId, 10) : null,
                );
            }
        },
        [setFeedbackData, setIsChatOpen, trackAction, mapId],
    );

    // 事件監聽（只有在 Feedback 啟用時才監聽）
    useMapEventNotifier(isFeedbackEnabled ? addOperation : null);

    // 清理 alerts（當 mapId 改變）
    useEffect(() => {
        setAlerts([]);
    }, [mapId, setAlerts]);

    // ==================== Essay 相關邏輯 ====================
    const {
        data: essayData,
        isLoading: isEssayLoading,
        error: essayError,
    } = useGetEssayQuery(mapId, { skip: !mapId || view !== 'essay' });
    const [essayContent, setEssayContent] = useState('');

    useEffect(() => {
        if (mapError) {
            console.error('Failed to load map:', mapError);
        }
        if (essayError) {
            console.error('Failed to load essay:', essayError);
        }
    }, [mapError, essayError]);

    // 當 mapId 變化時，立即清空 essay 內容
    useEffect(() => {
        setEssayContent('');
    }, [mapId]);

    // 當 essayData 更新時，同步內容（包括空字串）
    useEffect(() => {
        if (essayData?.essay) {
            setEssayContent(essayData.essay.content || '');
        }
    }, [essayData]);

    const { isEssayValid, handleEssayChange } = useEssayValidation();

    // 處理內容改變：整合驗證與更新
    const onEssayChange = useCallback((newContent) => {
        handleEssayChange(newContent, setEssayContent);
    }, [handleEssayChange]);

    const editorRef = useRef(null);
    const handleEssayAutoSave = useEssayAutoSave(mapId, essayContent, essayData?.essay?.id);

    const {
        isSending: isEssaySending,
        handleSendMessage: sendEssayMessage,
    } = useEssaySendMessage(
        mapId,
        handleEssayAutoSave,
        editorRef,
        essayData?.essay?.id,
        handleMapAutoSave,
    );

    // ==================== 渲染邏輯 ====================
    if (!mapId) {
        return (
            <Alert
                message="Error"
                description="Mind map ID not found"
                type="error"
                showIcon
            />
        );
    }

    // 根據 view 決定使用哪個 loading 和 error
    let isLoading;
    let error;

    if (view === 'article') {
        // Article 視圖只需要 mapData
        isLoading = isMapLoading;
        error = mapError;
    }
    else if (view === 'essay') {
        // Essay 視圖需要 mapData 和 essayData
        isLoading = isEssayLoading || isMapLoading;
        error = essayError || mapError;
    }
    else {
        // MindMap 視圖只需要 mapData
        isLoading = isMapLoading;
        error = mapError;
    }

    if (isLoading) {
        return (
            <Spin size="large" tip="Loading...">
                <div style={{ textAlign: 'center', padding: '50px' }} />
            </Spin>
        );
    }

    if (error) {
        return (
            <Alert
                message="Error"
                description="Failed to load, please try again later"
                type="error"
                showIcon
            />
        );
    }

    const isReadOnly = mapData?.template?.is_within_deadline === false;

    // 根據 view 參數決定顯示的內容
    if (view === 'article') {
        const articleContent = mapData?.template?.article_content || '';
        return (
            <div style={{ height: '100%', width: '100%' }}>
                <ArticlePageContent articleContent={articleContent} />
            </div>
        );
    }

    if (view === 'essay') {
        return (
            <div style={{ height: '100%', width: '100%' }}>
                <EssayPageContent
                    key={mapId}
                    essayContent={essayContent}
                    setEssayContent={onEssayChange}
                    isEssayValid={isEssayValid}
                    isChatOpen={isChatOpen}
                    setIsChatOpen={setIsChatOpen}
                    handleSendMessage={sendEssayMessage}
                    isSending={isEssaySending}
                    editorRef={editorRef}
                    mapContext={mapContext}
                    essayId={essayData?.essay?.id}
                    isReadOnly={isReadOnly}
                />
            </div>
        );
    }

    // 預設顯示 Mind Map
    return (
        <div style={{ height: '100%', width: '100%' }}>
            <MapPageContent
                key={mapId}
                mapContext={mapContext}
                alerts={isFeedbackEnabled ? alerts : []}
                handleAskClick={isFeedbackEnabled ? handleAskClick : null}
                handleSendMessage={handleSendMessage}
                setIsChatOpen={setIsChatOpen}
                isChatOpen={isChatOpen}
                feedbackData={isFeedbackEnabled ? feedbackData : null}
                handleCloseFeedback={handleCloseFeedback}
                isSending={isMapSending}
                isReadOnly={isReadOnly}
            />
        </div>
    );
};
