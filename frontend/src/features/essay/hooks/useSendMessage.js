import { useCallback, useState } from 'react';

import { useSendEssayChatMessageMutation } from '../../chat/chatApi';

/**
 * Essay 訊息發送 hook
 * 參考 features/map/hooks/useSendMessage.js
 *
 * @param {string} mapId - 地圖 ID
 * @param {Function} handleSave - Essay 儲存函數
 * @returns {Object} { isSending, handleSendMessage }
 */
export const useSendMessage = (mapId, handleSave) => {
    const [isSending, setIsSending] = useState(false);
    const [sendChatMessage] = useSendEssayChatMessageMutation();

    const handleSendMessage = useCallback(
        async (text) => {
            if (!text.trim()) return;

            try {
                setIsSending(true);
                // 1. 自動儲存 essay（總是執行）
                if (handleSave) {
                    await handleSave();
                }

                // 2. 發送訊息
                await sendChatMessage({
                    message: text,
                    mapId,
                }).unwrap();
            }
            catch (err) {
                console.error('發送失敗:', err);
                throw err;
            }
            finally {
                setIsSending(false);
            }
        },
        [handleSave, sendChatMessage, mapId],
    );

    return { isSending, handleSendMessage };
};
