import { useCallback, useEffect, useState } from 'react';

import {
    Alert,
    Col,
    Row,
    Spin,
} from 'antd';
import { useSearchParams } from 'react-router-dom';

import { Chat } from '../features/chat/Chat';
import { FloatingChatButton } from '../features/chat/FloatingChatButton';
import { BaseMap } from '../features/map/BaseMap';
import { ToolBlock } from '../features/map/components/toolbar';
import { useMapEventNotifier } from '../features/map/events';
import { useMapNodes } from '../features/map/hooks';
import { MapProvider } from '../features/map/MapProvider';
import { SaveButton } from '../features/map/SaveButton';
import { useGetMapQuery } from '../features/map/utils';
import { OperateAlertList } from '../features/OperateAlertList/OperateAlertList';

export const MapPage = () => {
    const [searchParams] = useSearchParams();
    const mapId = searchParams.get('mapId');

    const [alerts, setAlerts] = useState([]);

    const addAlert = useCallback((message) => {
        const newAlert = {
            id: Date.now(),
            message,
        };
        setAlerts((prev) => [newAlert, ...prev]);
    }, []);

    useEffect(() => {
        setAlerts([]);
    }, [mapId]);

    useMapEventNotifier(addAlert);

    const [isChatOpen, setIsChatOpen] = useState(() => {
        const saved = localStorage.getItem('chatIsOpen');
        return saved === 'true';
    });

    const [feedbackData, setFeedbackData] = useState(null);

    const handleAskClick = (message, description) => {
        setFeedbackData({ message, description });
        setIsChatOpen(true);
    };

    const handleCloseFeedback = () => {
        setFeedbackData(null);
    };

    useEffect(() => {
        localStorage.setItem('chatIsOpen', isChatOpen);
    }, [isChatOpen]);

    const { data: mapData, isLoading, error } = useGetMapQuery(mapId, {
        skip: !mapId,
    });

    const mapContext = useMapNodes(mapData);

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
                                    <SaveButton />
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
