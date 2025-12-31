import { useCallback, useState } from 'react';

import { useSendChatMessageMutation } from '../../chat/chatApi';

/**
 * 訊息發送 hook
 * 處理訊息發送邏輯，包含自動儲存和發送狀態管理
 *
 * @param {string} mapId - 地圖 ID
 * @param {Function} handleAutoSave - 自動儲存函數
 * @returns {Object} { isSending, handleSendMessage }
 */
export const useSendMessage = (mapId, handleAutoSave) => {
    const [isSending, setIsSending] = useState(false);
    const [sendChatMessage] = useSendChatMessageMutation();

    const handleSendMessage = useCallback(
        async (text) => {
            if (!text.trim()) return;

            try {
                setIsSending(true);
                // 1. 自動儲存 map（總是執行）
                await handleAutoSave();

                // 2. 發送訊息
                await sendChatMessage({
                    message: text,
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
        },
        [handleAutoSave, sendChatMessage, mapId],
    );

    return { isSending, handleSendMessage };
};
