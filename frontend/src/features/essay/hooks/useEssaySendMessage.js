import { useCallback, useState } from 'react';

import { App } from 'antd';

import { useSendEssayChatMessageMutation } from '../../chat/chatApi';
import { useUserActionTracker } from '../../userAction/hooks';

/**
 * Essay 訊息發送 hook
 * 參考 features/map/hooks/useSendMessage.js
 *
 * @param {string} mapId - 地圖 ID
 * @param {Function} handleSave - Essay 儲存函數
 * @param {Object} editorRef - Editor instance ref (for getText())
 * @returns {Object} { isSending, handleSendMessage }
 */
export const useEssaySendMessage = (mapId, handleSave, editorRef) => {
    const { message } = App.useApp();
    const [isSending, setIsSending] = useState(false);
    const [sendChatMessage] = useSendEssayChatMessageMutation();
    const { trackAction } = useUserActionTracker();

    const handleSendMessage = useCallback(
        async (text) => {
            if (!text.trim()) return;

            try {
                setIsSending(true);

                // 立即記錄聊天行為
                trackAction('chat_in_essay', {}, mapId ? parseInt(mapId, 10) : null);

                // 1. 自動儲存 essay（總是執行）
                if (handleSave) {
                    await handleSave();
                }

                // 2. 提取純文字內容
                const essayPlainText = editorRef?.current?.getText() || '';

                // 3. 發送訊息（包含純文字）
                await sendChatMessage({
                    message: text,
                    mapId,
                    essayPlainText,
                }).unwrap();
            }
            catch (err) {
                message.error('Operation failed');
                console.error('Failed to send essay message:', err);
                throw err;
            }
            finally {
                setIsSending(false);
            }
        },
        [handleSave, sendChatMessage, mapId, editorRef, trackAction],
    );

    return { isSending, handleSendMessage };
};
