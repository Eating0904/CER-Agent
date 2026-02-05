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
 * @param {string|null} essayId - Essay ID
 * @param {Function|null} handleMapAutoSave - MindMap 自動儲存函數
 * @returns {Object} { isSending, handleSendMessage }
 */
export const useEssaySendMessage = (
    mapId,
    handleSave,
    editorRef,
    essayId = null,
    handleMapAutoSave = null,
) => {
    const { message } = App.useApp();
    // 使用 Set 追蹤所有正在發送訊息的 mapId
    // 這樣可以支援同時在多個 map 發送訊息的情況
    const [sendingMapIds, setSendingMapIds] = useState(new Set());
    const [sendChatMessage] = useSendEssayChatMessageMutation();
    const { trackAction } = useUserActionTracker();

    const handleSendMessage = useCallback(
        async (text) => {
            if (!text.trim()) return;

            try {
                // 加入當前 mapId 到發送中集合
                setSendingMapIds((prev) => new Set(prev).add(mapId));

                // 立即記錄聊天行為並獲取 action_id
                const { actionId } = await trackAction(
                    'chat_in_essay',
                    {},
                    mapId ? parseInt(mapId, 10) : null,
                    essayId ? parseInt(essayId, 10) : null,
                );

                // 1. 先自動儲存 mindmap（如果有提供）
                if (handleMapAutoSave) {
                    await handleMapAutoSave(null, 'before_chat_in_essay');
                }

                // 2. 自動儲存 essay（總是執行）
                if (handleSave) {
                    await handleSave();
                }

                // 3. 提取純文字內容
                const essayPlainText = editorRef?.current?.getText() || '';

                // 4. 發送訊息
                await sendChatMessage({
                    message: text,
                    mapId,
                    essayPlainText,
                    userActionId: actionId,
                }).unwrap();
            }
            catch (err) {
                message.error('Operation failed');
                console.error('Failed to send essay message:', err);
                throw err;
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
        [
            handleSave,
            sendChatMessage,
            mapId,
            editorRef,
            trackAction,
            message,
            essayId,
            handleMapAutoSave,
        ],
    );

    // 檢查當前 mapId 是否在發送中集合中
    const isSending = sendingMapIds.has(mapId);

    return { isSending, handleSendMessage };
};
