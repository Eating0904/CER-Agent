import { useCallback } from 'react';

import { App } from 'antd';
import { useSearchParams } from 'react-router-dom';

import { useUserActionTracker } from '../../userAction/hooks';
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
    const [searchParams] = useSearchParams();
    const mapIdFromParams = searchParams.get('mapId');
    const { trackAction } = useUserActionTracker();

    const handleAutoSave = useCallback(async (triggerReason = 'before_chat', essayId = null) => {
        if (!mapId) {
            console.error('Essay AutoSave: mapId is required');
            return;
        }

        try {
            const response = await updateEssay({
                mapId,
                content: essayContent,
            }).unwrap();

            message.info('essay has been auto-saved');

            // 記錄自動儲存行為
            trackAction(
                'auto_save_essay',
                {
                    content_length: essayContent.length,
                    trigger_reason: triggerReason,
                },
                mapIdFromParams ? parseInt(mapIdFromParams, 10) : null,
                essayId || response?.id || null,
            );
        }
        catch (error) {
            message.warning('Auto-save failed');
            console.error('Essay 自動儲存失敗:', error);
            throw error;
        }
    }, [mapId, essayContent, updateEssay, message, mapIdFromParams, trackAction]);

    return handleAutoSave;
};
