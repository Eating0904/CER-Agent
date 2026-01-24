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
import { useHeaderContext } from '../shared/HeaderContext';

import { EssayPageContent } from './EssayPageContent';
import { MapPageContent } from './MapPageContent';

export const MapPage = () => {
    const [searchParams] = useSearchParams();
    const mapId = searchParams.get('mapId');
    const view = searchParams.get('view') || 'mindmap';

    const { setHeaderContent } = useHeaderContext();

    // 設定 Header 內容為 ViewSwitcher
    useEffect(() => {
        setHeaderContent(<ViewSwitcher />);

        // 清理函數：當組件卸載時清空 Header 內容
        return () => setHeaderContent(null);
    }, [setHeaderContent]);

    // ==================== MindMap 相關邏輯 ====================
    const {
        data: mapData,
        isLoading: isMapLoading,
        error: mapError,
    } = useGetMapQuery(mapId, { skip: !mapId });
    const mapContext = useMapNodes(mapData);

    const handleMapAutoSave = useMapAutoSave(mapId, mapContext.nodes, mapContext.edges);
    const { addOperation, alerts, setAlerts } = useFeedbackQueue(mapId, handleMapAutoSave);

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
                ? `[Operate]\\n${feedbackData.message}\\n[Feedback]\\n${feedbackData.description}\\n[Question]\\n${text}`
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
        (message, description) => {
            setFeedbackData({ message, description });
            setIsChatOpen(true);
        },
        [setFeedbackData, setIsChatOpen],
    );

    // 事件監聽
    useMapEventNotifier(addOperation);

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

    useEffect(() => {
        if (essayData?.essay?.content) {
            setEssayContent(essayData.essay.content);
        }
        else {
            setEssayContent('');
        }
    }, [essayData, mapId]);

    const { isEssayValid, handleEssayChange } = useEssayValidation();

    // 處理內容改變：整合驗證與更新
    const onEssayChange = useCallback((newContent) => {
        handleEssayChange(newContent, setEssayContent);
    }, [handleEssayChange]);

    const editorRef = useRef(null);
    const handleEssayAutoSave = useEssayAutoSave(mapId, essayContent);

    const {
        isSending: isEssaySending,
        handleSendMessage: sendEssayMessage,
    } = useEssaySendMessage(mapId, handleEssayAutoSave, editorRef);

    // ==================== 渲染邏輯 ====================
    if (!mapId) {
        return (
            <Alert
                message="錯誤"
                description="未找到地圖 ID"
                type="error"
                showIcon
            />
        );
    }

    // 根據 view 決定使用哪個 loading 和 error
    const isLoading = view === 'essay' ? (isEssayLoading || isMapLoading) : isMapLoading;
    const error = view === 'essay' ? (essayError || mapError) : mapError;

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
                message="錯誤"
                description="載入失敗，請稍後再試"
                type="error"
                showIcon
            />
        );
    }

    // 根據 view 參數決定顯示的內容
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
                alerts={alerts}
                handleAskClick={handleAskClick}
                handleSendMessage={handleSendMessage}
                setIsChatOpen={setIsChatOpen}
                isChatOpen={isChatOpen}
                feedbackData={feedbackData}
                handleCloseFeedback={handleCloseFeedback}
                isSending={isMapSending}
            />
        </div>
    );
};
