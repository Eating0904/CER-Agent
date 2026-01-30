import { Col, Row, Space } from 'antd';

import { Chat } from '../features/chat/Chat';
import { FloatingChatButton } from '../features/chat/FloatingChatButton';
import { BaseMap } from '../features/map/BaseMap';
import { ToolBlock } from '../features/map/components/toolbar';
import { MapProvider } from '../features/map/MapProvider';
import { MapSaveButton } from '../features/map/MapSaveButton';
import { ScoreButton } from '../features/map/ScoreButton';
import { OperateAlertList } from '../features/OperateAlertList/OperateAlertList';

/**
 * MapPageContent 組件
 * 負責 MapPage 的主要 UI 渲染，包含地圖、工具列、alerts、chat 等所有視覺元素
 *
 * @param {Object} props
 * @param {Object} props.mapContext - 地圖上下文（包含 nodes 和 edges）
 * @param {Array} props.alerts - Alert 列表
 * @param {Function} props.handleAskClick - 處理 Ask 按鈕點擊
 * @param {Function} props.handleSendMessage - 處理訊息發送
 * @param {Function} props.setIsChatOpen - 設置 chat 開關狀態
 * @param {boolean} props.isChatOpen - chat 是否開啟
 * @param {Object} props.feedbackData - feedback 資料
 * @param {Function} props.handleCloseFeedback - 關閉 feedback
 * @param {boolean} props.isSending - 訊息是否發送中
 */
export const MapPageContent = ({
    mapContext,
    alerts,
    handleAskClick,
    handleSendMessage,
    setIsChatOpen,
    isChatOpen,
    feedbackData,
    handleCloseFeedback,
    isSending,
    isReadOnly = false,
}) => (
    <>
        <MapProvider value={mapContext}>
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {!isReadOnly && <ToolBlock />}
                <Row style={{ flex: 1, minHeight: 0 }}>
                    {handleAskClick && (
                        <Col span={3} style={{ height: '100%', overflowY: 'auto' }}>
                            <OperateAlertList alerts={alerts} onAskClick={handleAskClick} />
                        </Col>
                    )}
                    <Col span={handleAskClick ? 21 : 24} style={{ height: '100%', position: 'relative' }}>
                        <BaseMap readOnly={isReadOnly} />
                        {!isReadOnly && (
                            <div
                                style={{
                                    position: 'absolute',
                                    top: '16px',
                                    right: '16px',
                                    zIndex: 10,
                                }}
                            >
                                <Space>
                                    <MapSaveButton />
                                    <ScoreButton
                                        onSendMessage={handleSendMessage}
                                        setIsChatOpen={setIsChatOpen}
                                    />
                                </Space>
                            </div>
                        )}
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
            isReadOnly={isReadOnly}
        />
        <FloatingChatButton
            isChatOpen={isChatOpen}
            onClick={() => setIsChatOpen(true)}
        />
    </>
);
