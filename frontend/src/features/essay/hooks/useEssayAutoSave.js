import { useCallback } from 'react';

import { App } from 'antd';

import { useUpdateEssayMutation } from '../essayApi';

/**
 * Essay 自動儲存 hook
 * 參考 features/map/hooks/useAutoSave.js
 *
 * @param {string} mapId - 地圖 ID
 * @param {string} essayContent - Essay 內容
 * @returns {Function} handleAutoSave - 自動儲存函數
 */
export const useEssayAutoSave = (mapId, essayContent) => {
    const { message } = App.useApp();
    const [updateEssay] = useUpdateEssayMutation();

    const handleAutoSave = useCallback(async () => {
        if (!mapId) {
            console.warn('Essay AutoSave: mapId is required');
            return;
        }

        try {
            await updateEssay({
                mapId,
                content: essayContent,
            }).unwrap();

            message.info('essay has been auto-saved');
        }
        catch (error) {
            message.warning('Auto-save failed');
            console.error('Essay 自動儲存失敗:', error);
            throw error;
        }
    }, [mapId, essayContent, updateEssay, message]);

    return handleAutoSave;
};
