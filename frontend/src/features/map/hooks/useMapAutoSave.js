import { useCallback, useEffect, useRef } from 'react';

import { App } from 'antd';
import { useSearchParams } from 'react-router-dom';

import { useUserActionTracker } from '../../userAction/hooks';
import { useUpdateMapMutation } from '../utils';

/**
 * 自動儲存 hook
 * 封裝心智圖自動儲存邏輯，處理內部的 ref 複雜性以提供穩定的 callback
 *
 * @param {string} mapId - 心智圖 ID
 * @param {Array} nodes - 節點陣列
 * @param {Array} edges - 連線陣列
 * @returns {Function} handleAutoSave - 自動儲存函數
 */
export const useMapAutoSave = (mapId, nodes, edges) => {
    const { message } = App.useApp();
    const [updateMap] = useUpdateMapMutation();
    const [searchParams] = useSearchParams();
    const mapIdFromParams = searchParams.get('mapId');
    const { trackAction } = useUserActionTracker();
    const nodesRef = useRef(nodes);
    const edgesRef = useRef(edges);

    useEffect(() => {
        nodesRef.current = nodes;
        edgesRef.current = edges;
    }, [nodes, edges]);

    const handleAutoSave = useCallback(
        async (overrideEdges = null, triggerReason = null) => {
            // overrideEdges: 用於處理 React 狀態異步更新的時序問題
            // 當連接節點時，事件可能在 edges 狀態更新前發送，需要手動傳入最新的 edges
            // triggerReason: 觸發自動儲存的原因 (before_chat / before_feedback)
            const edgesToSave = overrideEdges || edgesRef.current;

            try {
                await updateMap({
                    id: mapId,
                    nodes: nodesRef.current,
                    edges: edgesToSave,
                }).unwrap();
                message.info('map has been auto-saved');

                // 記錄自動儲存行為
                if (triggerReason) {
                    trackAction('auto_save_map', {
                        nodes_count: nodesRef.current.length,
                        edges_count: edgesToSave.length,
                        trigger_reason: triggerReason,
                    }, mapIdFromParams ? parseInt(mapIdFromParams, 10) : null);
                }
            }
            catch (err) {
                message.warning('Auto-save failed');
                console.error('自動儲存錯誤:', err);
            }
        },
        [mapId, updateMap, message, mapIdFromParams, trackAction],
    );

    return handleAutoSave;
};
