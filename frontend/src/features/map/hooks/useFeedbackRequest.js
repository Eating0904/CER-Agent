import { useCallback } from 'react';

import { useCreateFeedbackMutation } from '../../OperateAlertList/feedbackApi';

/**
 * Feedback Request Hook
 *
 * 負責處理 feedback 請求和自動儲存
 *
 * @param {string} mapId - 心智圖 ID
 * @param {Function} handleAutoSave - 自動儲存函數
 * @returns {{ sendFeedback: Function }}
 */
export const useFeedbackRequest = (mapId, handleAutoSave) => {
    const [createFeedback] = useCreateFeedbackMutation();

    const sendFeedback = useCallback(
        async (operations, alertMessage, edgesToSave = null) => {
            await handleAutoSave(edgesToSave);

            const response = await createFeedback({
                mapId: parseInt(mapId, 10),
                operations,
                alertMessage,
            }).unwrap();

            if (!response.success) {
                throw new Error(response.error || '生成回饋失敗');
            }

            return {
                feedback: response.data.feedback,
            };
        },
        [mapId, createFeedback, handleAutoSave],
    );

    return { sendFeedback };
};
