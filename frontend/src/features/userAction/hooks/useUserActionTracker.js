import { useCallback } from 'react';

import { useRecordActionMutation } from '../userActionApi';

/**
 * 統一的使用者行為追蹤 hook
 * @returns {{ trackAction: Function }}
 */
export const useUserActionTracker = () => {
    const [recordAction] = useRecordActionMutation();

    const trackAction = useCallback(
        async (actionType, metadata = {}, mapId = null) => {
            try {
                const result = await recordAction({
                    action_type: actionType,
                    map_id: mapId,
                    metadata,
                }).unwrap();

                return { actionId: result?.id };
            }
            catch (error) {
                console.error('Failed to track user action:', error);
                return { actionId: null };
            }
        },
        [recordAction],
    );

    return { trackAction };
};
