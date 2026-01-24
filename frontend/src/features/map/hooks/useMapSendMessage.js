import { useCallback, useState } from 'react';

import { App } from 'antd';

import { useSendChatMessageMutation } from '../../chat/chatApi';
import { useUserActionTracker } from '../../userAction/hooks';

/**
 * 訊息發送 hook
 * 處理訊息發送邏輯，包含自動儲存和發送狀態管理
 *
 * @param {string} mapId - 地圖 ID
 * @param {Function} handleAutoSave - 自動儲存函數
 * @returns {Object} { isSending, handleSendMessage }
 */
export const useMapSendMessage = (mapId, handleAutoSave) => {
    const { message } = App.useApp();
    const [isSending, setIsSending] = useState(false);
    const [sendChatMessage] = useSendChatMessageMutation();
    const { trackAction } = useUserActionTracker();

    const handleSendMessage = useCallback(
        async (text) => {
            if (!text.trim()) return;

            try {
                setIsSending(true);

                // 立即記錄聊天行為
                trackAction('chat_in_mindmap', {}, mapId ? parseInt(mapId, 10) : null);

                // 1. 自動儲存 map（總是執行）
                await handleAutoSave(null, 'before_chat');

                // 2. 發送訊息
                await sendChatMessage({
                    message: text,
                    mapId,
                }).unwrap();
            }
            catch (err) {
                message.error('Operation failed');
                console.error('Failed to send mindmap message:', err);
                throw err; // 讓呼叫者知道失敗
            }
            finally {
                setIsSending(false);
            }
        },
        [handleAutoSave, sendChatMessage, mapId, trackAction],
    );

    return { isSending, handleSendMessage };
};
