import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';

import {
    Alert,
    Col,
    message,
    Row,
    Space,
    Spin,
} from 'antd';
import { useSearchParams } from 'react-router-dom';

import { Chat } from '../features/chat/Chat';
import { useSendChatMessageMutation } from '../features/chat/chatApi';
import { FloatingChatButton } from '../features/chat/FloatingChatButton';
import { BaseMap } from '../features/map/BaseMap';
import { ToolBlock } from '../features/map/components/toolbar';
import { useMapEventNotifier } from '../features/map/events';
import { useMapNodes } from '../features/map/hooks';
import { MapProvider } from '../features/map/MapProvider';
import { SaveButton } from '../features/map/SaveButton';
import { ScoreButton } from '../features/map/ScoreButton';
import { useGetMapQuery, useUpdateMapMutation } from '../features/map/utils';
import { useCreateFeedbackMutation } from '../features/OperateAlertList/feedbackApi';
import { OperateAlertList } from '../features/OperateAlertList/OperateAlertList';

export const MapPage = () => {
    const [searchParams] = useSearchParams();
    const mapId = searchParams.get('mapId');

    const [alerts, setAlerts] = useState([]);
    const [createFeedback] = useCreateFeedbackMutation();
    const [updateMap] = useUpdateMapMutation();
    const [sendChatMessage] = useSendChatMessageMutation();

    const [isChatOpen, setIsChatOpen] = useState(() => {
        const saved = localStorage.getItem('chatIsOpen');
        return saved === 'true';
    });

    const [feedbackData, setFeedbackData] = useState(null);
    const [isSending, setIsSending] = useState(false);

    const handleAskClick = (alertMessage, description) => {
        setFeedbackData({ message: alertMessage, description });
        setIsChatOpen(true);
    };

    const handleCloseFeedback = useCallback(() => {
        setFeedbackData(null);
    }, []);

    useEffect(() => {
        localStorage.setItem('chatIsOpen', isChatOpen);
    }, [isChatOpen]);

    const { data: mapData, isLoading, error } = useGetMapQuery(mapId, {
        skip: !mapId,
    });

    const mapContext = useMapNodes(mapData);

    const mapContextRef = useRef(mapContext);
    useEffect(() => {
        mapContextRef.current = mapContext;
    }, [mapContext]);

    const handleAutoSave = useCallback(async (overrideEdges = null) => {
        const currentMapContext = mapContextRef.current;
        const edgesToSave = overrideEdges || currentMapContext.edges;

        try {
            await updateMap({
                id: mapId,
                nodes: currentMapContext.nodes,
                edges: edgesToSave,
            }).unwrap();
            message.info('map has been auto-saved');
        }
        catch (err) {
            message.warning('Auto-save failed');
            console.error('自動儲存錯誤:', err);
        }
    }, [mapId, updateMap]);

    const handleSendMessage = useCallback(async (text) => {
        if (!text.trim()) return;

        const messageToSend = feedbackData
            ? `[Operate]\n${feedbackData.message}\n[Feedback]\n${feedbackData.description}\n[Question]\n${text}`
            : text;

        // 立即關閉 feedback
        if (feedbackData) {
            setFeedbackData(null);
        }

        try {
            setIsSending(true);
            // 1. 自動儲存 map（總是執行）
            await handleAutoSave();

            // 2. 發送訊息
            await sendChatMessage({
                message: messageToSend,
                mapId,
            }).unwrap();
        }
        catch (err) {
            console.error('發送失敗:', err);
            throw err; // 讓呼叫者知道失敗
        }
        finally {
            setIsSending(false);
        }
    }, [feedbackData, handleAutoSave, sendChatMessage, mapId]);

    const addAlert = useCallback(async (eventData) => {
        const {
            action,
            node_id: nodeId,
            connected_nodes: connectedNodes,
        } = eventData;

        // 1. 立即新增 loading 狀態的 Alert
        const tempAlertId = Date.now();
        let alertMessage = '';

        if (action === 'edit') {
            alertMessage = `${nodeId} has been edited`;
        }
        else if (action === 'connect') {
            alertMessage = `Connected ${connectedNodes[0]} and ${connectedNodes[1]}`;
        }

        const tempAlert = {
            id: tempAlertId,
            message: alertMessage,
            description: 'Generating feedback...',
            status: 'loading',
            showAsk: false,
        };

        setAlerts((prev) => [tempAlert, ...prev]);

        // 2. 自動儲存 map
        // 如果是連線事件，使用傳入的 newEdges；否則使用當前的 edges
        const edgesToSave = eventData.newEdges || null;
        await handleAutoSave(edgesToSave);

        // 3. 呼叫 feedback API
        try {
            const response = await createFeedback({
                mapId: parseInt(mapId, 10),
                text: alertMessage,
                meta: eventData,
            }).unwrap();

            // 4. 更新 Alert 為 success 狀態
            if (response.success) {
                setAlerts((prev) => prev.map((alert) => (alert.id === tempAlertId
                    ? {
                        ...alert,
                        description: response.data.feedback,
                        status: 'success',
                        showAsk: true,
                    }
                    : alert)));
            }
        }
        catch (err) {
            // 5. 更新 Alert 為 error 狀態
            setAlerts((prev) => prev.map((alert) => (alert.id === tempAlertId
                ? {
                    ...alert,
                    description: err.data?.error || err.message || '生成回饋失敗',
                    status: 'error',
                    showAsk: false,
                }
                : alert)));
        }
    }, [mapId, createFeedback, handleAutoSave]);

    // 使用 ref 保存最新的 addAlert，確保事件監聽器始終調用最新版本
    const addAlertRef = useRef(addAlert);
    useEffect(() => {
        addAlertRef.current = addAlert;
    }, [addAlert]);

    // 創建穩定的 wrapper 函數
    const stableAddAlert = useCallback((eventData) => {
        addAlertRef.current(eventData);
    }, []);

    useEffect(() => {
        setAlerts([]);
    }, [mapId]);

    useMapEventNotifier(stableAddAlert);

    const renderContent = () => {
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
            <>
                <MapProvider value={mapContext}>
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <ToolBlock />
                        <Row style={{ flex: 1, minHeight: 0 }}>
                            <Col span={3} style={{ height: '100%', overflowY: 'auto' }}>
                                <OperateAlertList alerts={alerts} onAskClick={handleAskClick} />
                            </Col>
                            <Col span={21} style={{ height: '100%', position: 'relative' }}>
                                <BaseMap />
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: '16px',
                                        right: '16px',
                                        zIndex: 10,
                                    }}
                                >
                                    <Space>
                                        <SaveButton />
                                        <ScoreButton
                                            onSendMessage={handleSendMessage}
                                            setIsChatOpen={setIsChatOpen}
                                        />
                                    </Space>
                                </div>
                            </Col>
                        </Row>
                    </div>
                </MapProvider>
                <Chat
                    isChatOpen={isChatOpen}
                    setIsChatOpen={setIsChatOpen}
                    feedbackData={feedbackData}
                    onCloseFeedback={handleCloseFeedback}
                    onSendMessage={handleSendMessage}
                    isSending={isSending}
                />
                <FloatingChatButton
                    isChatOpen={isChatOpen}
                    onClick={() => setIsChatOpen(true)}
                />
            </>
        );
    };

    return <div style={{ height: '100%', width: '100%' }}>{renderContent()}</div>;
};
