import {
    useCallback,
    useEffect,
    useState,
} from 'react';

import { Alert, Spin } from 'antd';
import { useSearchParams } from 'react-router-dom';

import { useGetEssayQuery } from '../features/essay/essayApi';
import {
    useAutoSave as useEssayAutoSave,
    useSendMessage as useEssaySendMessage,
} from '../features/essay/hooks';
import { ViewSwitcher } from '../features/map/components/viewSwitcher';
import { useMapEventNotifier } from '../features/map/events';
import {
    useAutoSave,
    useChatState,
    useFeedback,
    useFeedbackQueue,
    useMapNodes,
    useSendMessage,
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

    const { data: mapData, isLoading, error } = useGetMapQuery(mapId, {
        skip: !mapId,
    });
    const mapContext = useMapNodes(mapData);

    const handleAutoSave = useAutoSave(mapId, mapContext.nodes, mapContext.edges);
    const { addOperation, alerts, setAlerts } = useFeedbackQueue(mapId, handleAutoSave);

    const { isChatOpen, setIsChatOpen } = useChatState();
    const { feedbackData, setFeedbackData, handleCloseFeedback } = useFeedback();
    const { isSending, handleSendMessage: sendMessage } = useSendMessage(mapId, handleAutoSave);

    // Essay state 和邏輯
    const [essayContent, setEssayContent] = useState('');

    const { data: essayData } = useGetEssayQuery(mapId, { skip: !mapId || view !== 'essay' });

    // 載入 essay 內容
    useEffect(() => {
        if (essayData?.essay?.content) {
            setEssayContent(essayData.essay.content);
        }
    }, [essayData]);

    // Essay 自動儲存（使用 hook）
    const handleEssayAutoSave = useEssayAutoSave(mapId, essayContent);

    // Essay chat 發送訊息（發送前自動儲存）
    const {
        isSending: isEssaySending,
        handleSendMessage: sendEssayMessage,
    } = useEssaySendMessage(mapId, handleEssayAutoSave);

    // 事件監聽
    useMapEventNotifier(addOperation);

    // 設定 Header 內容為 ViewSwitcher
    useEffect(() => {
        setHeaderContent(<ViewSwitcher />);

        // 清理函數：當組件卸載時清空 Header 內容
        return () => setHeaderContent(null);
    }, [setHeaderContent]);

    // 處理 Ask 按鈕點擊
    const handleAskClick = useCallback(
        (message, description) => {
            setFeedbackData({ message, description });
            setIsChatOpen(true);
        },
        [setFeedbackData, setIsChatOpen],
    );

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

            await sendMessage(messageToSend);
        },
        [feedbackData, sendMessage, setFeedbackData],
    );

    // 清理 alerts（當 mapId 改變）
    useEffect(() => {
        setAlerts([]);
    }, [mapId, setAlerts]);

    // 簡化的渲染邏輯
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

    if (isLoading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" tip="載入地圖中..." />
            </div>
        );
    }

    if (error) {
        return (
            <Alert
                message="錯誤"
                description="載入地圖失敗，請稍後再試"
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
                    essayContent={essayContent}
                    setEssayContent={setEssayContent}
                    isChatOpen={isChatOpen}
                    setIsChatOpen={setIsChatOpen}
                    handleSendMessage={sendEssayMessage}
                    isSending={isEssaySending}
                />
            </div>
        );
    }

    // 預設顯示 Mind Map
    return (
        <div style={{ height: '100%', width: '100%' }}>
            <MapPageContent
                mapContext={mapContext}
                alerts={alerts}
                handleAskClick={handleAskClick}
                handleSendMessage={handleSendMessage}
                setIsChatOpen={setIsChatOpen}
                isChatOpen={isChatOpen}
                feedbackData={feedbackData}
                handleCloseFeedback={handleCloseFeedback}
                isSending={isSending}
            />
        </div>
    );
};
