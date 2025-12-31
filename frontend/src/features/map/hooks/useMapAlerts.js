import { useCallback, useState } from 'react';

import { useCreateFeedbackMutation } from '../../OperateAlertList/feedbackApi';

/**
 * Map Alerts 管理 hook
 * 管理 alerts 的創建、更新和 feedback API 調用
 *
 * @param {string} mapId - 地圖 ID
 * @param {Function} handleAutoSave - 自動儲存函數
 * @returns {Object} { alerts, addAlert }
 */
export const useMapAlerts = (mapId, handleAutoSave) => {
    const [alerts, setAlerts] = useState([]);
    const [createFeedback] = useCreateFeedbackMutation();

    const addAlert = useCallback(
        async (eventData) => {
            const {
                action,
                node_id: nodeId,
                connected_nodes: connectedNodes,
            } = eventData;

            // 1. 立即新增 loading 狀態的 Alert
            const tempAlertId = Date.now();
            let alertMessage = '';

            if (action === 'edit') {
                alertMessage = `${nodeId} has been edited`;
            }
            else if (action === 'connect') {
                alertMessage = `Connected ${connectedNodes[0]} and ${connectedNodes[1]}`;
            }

            const tempAlert = {
                id: tempAlertId,
                message: alertMessage,
                description: 'Generating feedback...',
                status: 'loading',
                showAsk: false,
            };

            setAlerts((prev) => [tempAlert, ...prev]);

            // 2. 自動儲存 map
            // 如果是連線事件，使用傳入的 newEdges；否則使用當前的 edges
            const edgesToSave = eventData.newEdges || null;
            await handleAutoSave(edgesToSave);

            // 3. 呼叫 feedback API
            try {
                const response = await createFeedback({
                    mapId: parseInt(mapId, 10),
                    text: alertMessage,
                    meta: eventData,
                }).unwrap();

                // 4. 更新 Alert 為 success 狀態
                if (response.success) {
                    setAlerts((prev) => prev.map((alert) => (alert.id === tempAlertId
                        ? {
                            ...alert,
                            description: response.data.feedback,
                            status: 'success',
                            showAsk: true,
                        }
                        : alert)));
                }
            }
            catch (err) {
                // 5. 更新 Alert 為 error 狀態
                setAlerts((prev) => prev.map((alert) => (alert.id === tempAlertId
                    ? {
                        ...alert,
                        description:
                                      err.data?.error
                                      || err.message
                                      || '生成回饋失敗',
                        status: 'error',
                        showAsk: false,
                    }
                    : alert)));
            }
        },
        [mapId, createFeedback, handleAutoSave],
    );

    return { alerts, setAlerts, addAlert };
};
