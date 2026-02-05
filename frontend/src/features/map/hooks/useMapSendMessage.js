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
    // 使用 Set 追蹤所有正在發送訊息的 mapId
    // 這樣可以支援同時在多個 map 發送訊息的情況
    const [sendingMapIds, setSendingMapIds] = useState(new Set());
    const [sendChatMessage] = useSendChatMessageMutation();
    const { trackAction } = useUserActionTracker();

    const handleSendMessage = useCallback(
        async (text) => {
            if (!text.trim()) return;

            try {
                // 加入當前 mapId 到發送中集合
                setSendingMapIds((prev) => new Set(prev).add(mapId));

                // 立即記錄聊天行為並獲取 action_id
                const { actionId } = await trackAction('chat_in_mindmap', {}, mapId ? parseInt(mapId, 10) : null);

                // 1. 自動儲存 map（總是執行）
                await handleAutoSave(null, 'before_chat');

                // 2. 發送訊息
                await sendChatMessage({
                    message: text,
                    mapId,
                    userActionId: actionId,
                }).unwrap();
            }
            catch (err) {
                message.error('Operation failed');
                console.error('Failed to send mindmap message:', err);
                throw err; // 讓呼叫者知道失敗
            }
            finally {
                // 從發送中集合移除當前 mapId
                setSendingMapIds((prev) => {
                    const next = new Set(prev);
                    next.delete(mapId);
                    return next;
                });
            }
        },
        [handleAutoSave, sendChatMessage, mapId, trackAction, message],
    );

    // 檢查當前 mapId 是否在發送中集合中
    const isSending = sendingMapIds.has(mapId);

    return { isSending, handleSendMessage };
};
