import { useCallback, useEffect } from 'react';

import { Alert, Spin } from 'antd';
import { useSearchParams } from 'react-router-dom';

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

import { MapPageContent } from './MapPageContent';

export const MapPage = () => {
    const [searchParams] = useSearchParams();
    const mapId = searchParams.get('mapId');

    const { data: mapData, isLoading, error } = useGetMapQuery(mapId, {
        skip: !mapId,
    });
    const mapContext = useMapNodes(mapData);

    const handleAutoSave = useAutoSave(mapId, mapContext.nodes, mapContext.edges);
    const { addOperation, alerts, setAlerts } = useFeedbackQueue(mapId, handleAutoSave);

    const { isChatOpen, setIsChatOpen } = useChatState();
    const { feedbackData, setFeedbackData, handleCloseFeedback } = useFeedback();
    const { isSending, handleSendMessage: sendMessage } = useSendMessage(mapId, handleAutoSave);

    // 事件監聽
    useMapEventNotifier(addOperation);

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
                ? `[Operate]\n${feedbackData.message}\n[Feedback]\n${feedbackData.description}\n[Question]\n${text}`
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
