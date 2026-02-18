import { Space } from 'antd';
import Split from 'react-split';

import { Chat } from '../features/chat/Chat';
import { FloatingChatButton } from '../features/chat/FloatingChatButton';
import { EssayEditor } from '../features/essay/EssayEditor';
import { EssaySaveButton } from '../features/essay/EssaySaveButton';
import { EssayScoreButton } from '../features/essay/EssayScoreButton';
import { BaseMap } from '../features/map/BaseMap';
import { MapProvider } from '../features/map/MapProvider';

/**
 * EssayPageContent 組件（presentational）
 * 只負責 UI 渲染，所有邏輯由 MapPage 處理
 */
export const EssayPageContent = ({
    essayContent,
    setEssayContent,
    isChatOpen,
    setIsChatOpen,
    handleSendMessage,
    isSending,
    editorRef,
    mapContext,

    essayId = null,
    isReadOnly = false,
}) => (
    <>
        <div style={{ height: '100%', display: 'flex' }}>
            <Split
                sizes={[50, 50]}
                minSize={200}
                gutterSize={8}
                style={{ display: 'flex', height: '100%', width: '100%' }}
            >
                {/* 左側面板 - 心智圖預覽 */}
                <div
                    style={{
                        height: '100%',
                        backgroundColor: '#f5f5f5',
                        position: 'relative',
                    }}
                >
                    <MapProvider value={mapContext}>
                        <BaseMap readOnly />
                    </MapProvider>
                </div>

                {/* 右側面板 - Editor */}
                <div style={{ height: '100%', position: 'relative' }}>
                    <EssayEditor
                        essayContent={essayContent}
                        setEssayContent={setEssayContent}
                        editorRef={editorRef}
                        disabled={isReadOnly}
                        essayId={essayId}
                    />

                    {!isReadOnly && (
                        <div
                            style={{
                                position: 'absolute',
                                top: '10px',
                                right: '16px',
                                zIndex: 10,
                            }}
                        >
                            <Space>
                                <EssaySaveButton
                                    essayContent={essayContent}
                                    essayId={essayId}
                                />
                                <EssayScoreButton
                                    onSendMessage={handleSendMessage}
                                    setIsChatOpen={setIsChatOpen}
                                    essayId={essayId}
                                    isSending={isSending}
                                />
                            </Space>
                        </div>
                    )}
                </div>
            </Split>
        </div>

        <Chat
            isChatOpen={isChatOpen}
            setIsChatOpen={setIsChatOpen}
            onSendMessage={handleSendMessage}
            isSending={isSending}
            chatType="essay"
            isReadOnly={isReadOnly}
        />

        <FloatingChatButton
            isChatOpen={isChatOpen}
            onClick={() => setIsChatOpen(true)}
        />
    </>
);
