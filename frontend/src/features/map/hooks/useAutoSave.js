import { useCallback, useEffect, useRef } from 'react';

import { message } from 'antd';

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
export const useAutoSave = (mapId, nodes, edges) => {
    const [updateMap] = useUpdateMapMutation();
    const nodesRef = useRef(nodes);
    const edgesRef = useRef(edges);

    useEffect(() => {
        nodesRef.current = nodes;
        edgesRef.current = edges;
    }, [nodes, edges]);

    const handleAutoSave = useCallback(
        async (overrideEdges = null) => {
            // overrideEdges: 用於處理 React 狀態異步更新的時序問題
            // 當連接節點時，事件可能在 edges 狀態更新前發送，需要手動傳入最新的 edges
            const edgesToSave = overrideEdges || edgesRef.current;

            try {
                await updateMap({
                    id: mapId,
                    nodes: nodesRef.current,
                    edges: edgesToSave,
                }).unwrap();
                message.info('map has been auto-saved');
            }
            catch (err) {
                message.warning('Auto-save failed');
                console.error('自動儲存錯誤:', err);
            }
        },
        [mapId, updateMap],
    );

    return handleAutoSave;
};
