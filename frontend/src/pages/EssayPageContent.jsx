import Split from 'react-split';

import { Chat } from '../features/chat/Chat';
import { FloatingChatButton } from '../features/chat/FloatingChatButton';
import { EssayEditor } from '../features/essay/EssayEditor';
import { EssaySaveButton } from '../features/essay/EssaySaveButton';

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
                        padding: '16px',
                    }}
                >
                    {/* 未來可在此放置其他內容 */}
                </div>

                {/* 右側面板 - Editor */}
                <div style={{ height: '100%', position: 'relative' }}>
                    <EssayEditor
                        essayContent={essayContent}
                        setEssayContent={setEssayContent}
                        editorRef={editorRef}
                    />

                    <div
                        style={{
                            position: 'absolute',
                            top: '16px',
                            right: '16px',
                            zIndex: 10,
                            width: '100px',
                        }}
                    >
                        <EssaySaveButton essayContent={essayContent} />
                    </div>
                </div>
            </Split>
        </div>

        <Chat
            isChatOpen={isChatOpen}
            setIsChatOpen={setIsChatOpen}
            onSendMessage={handleSendMessage}
            isSending={isSending}
            chatType="essay"
        />

        <FloatingChatButton
            isChatOpen={isChatOpen}
            onClick={() => setIsChatOpen(true)}
        />
    </>
);
