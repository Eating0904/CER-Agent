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
}) => (
    <>
        <div style={{ height: '100%', position: 'relative' }}>
            <EssayEditor
                essayContent={essayContent}
                setEssayContent={setEssayContent}
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
