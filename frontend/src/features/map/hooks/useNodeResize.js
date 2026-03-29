import { useCallback, useRef } from 'react';

import { useReactFlow } from '@xyflow/react';

import { useMapContext } from './useMapContext';

/**
 * 封裝 node resize 拖拉邏輯
 * @param {string} nodeId - 目標 node ID
 * @param {number} positionAbsoluteX - node 在 canvas 的 X 座標（由 ReactFlow 傳入）
 * @param {number} positionAbsoluteY - node 在 canvas 的 Y 座標（由 ReactFlow 傳入）
 * @param {React.RefObject} nodeRef - node 外層 div 的 ref，用於取得初始尺寸
 * @returns {{ handleResizePointerDown: Function }}
 */
export const useNodeResize = (nodeId, positionAbsoluteX, positionAbsoluteY, nodeRef) => {
    const { updateNodeSizePreview, updateNodeSizeCommit } = useMapContext();
    const { getViewport } = useReactFlow();
    const dragState = useRef(null);

    const handleResizePointerDown = useCallback((e, dir) => {
        e.preventDefault();
        e.stopPropagation(); // 阻止 ReactFlow pointerdown 拖曳監聽器

        // 取得目前 canvas zoom，用於將螢幕像素換算回 canvas 像素
        const { zoom } = getViewport();

        // rect.width/height 是螢幕像素（含 zoom）→ 除以 zoom 得到 canvas 實際大小
        const rect = nodeRef.current.getBoundingClientRect();

        dragState.current = {
            startX: e.clientX,
            startY: e.clientY,
            startW: rect.width / zoom, // canvas 實際寬（px）
            startH: rect.height / zoom, // canvas 實際高（px）
            startNodeX: positionAbsoluteX, // node 在 canvas 的起始 X
            startNodeY: positionAbsoluteY, // node 在 canvas 的起始 Y
            dir,
            zoom,
        };

        const computeUpdate = (clientX, clientY) => {
            const ds = dragState.current;
            // 螢幕 delta → canvas delta
            const cdx = (clientX - ds.startX) / ds.zoom;
            const cdy = (clientY - ds.startY) / ds.zoom;

            // 寬高計算：
            //   dir.x =  1 → 右邊界右移，寬增
            //   dir.x = -1 → 左邊界左移，寬增（cdx 向左為負，乘 -1 得正增量）
            const newW = ds.dir.x !== 0 ? Math.max(1, ds.startW + ds.dir.x * cdx) : null;
            const newH = ds.dir.y !== 0 ? Math.max(1, ds.startH + ds.dir.y * cdy) : null;

            // 位置計算（僅左/上邊界需要移動 node）：
            //   dir.x = -1 → node.x 加上滑鼠水平移動量
            //   dir.y = -1 → node.y 加上滑鼠垂直移動量
            const newX = ds.dir.x === -1 ? ds.startNodeX + cdx : null;
            const newY = ds.dir.y === -1 ? ds.startNodeY + cdy : null;

            return {
                width: newW !== null ? Math.round(newW) : null,
                height: newH !== null ? Math.round(newH) : null,
                x: newX,
                y: newY,
            };
        };

        const onPointerMove = (moveEvent) => {
            if (!dragState.current) return;
            updateNodeSizePreview(nodeId, computeUpdate(moveEvent.clientX, moveEvent.clientY));
        };

        const onPointerUp = (upEvent) => {
            if (!dragState.current) return;
            updateNodeSizeCommit(nodeId, computeUpdate(upEvent.clientX, upEvent.clientY));
            dragState.current = null;
            document.removeEventListener('pointermove', onPointerMove);
            document.removeEventListener('pointerup', onPointerUp);
        };

        document.addEventListener('pointermove', onPointerMove);
        document.addEventListener('pointerup', onPointerUp);
    }, [
        nodeId,
        positionAbsoluteX,
        positionAbsoluteY,
        getViewport,
        updateNodeSizePreview,
        updateNodeSizeCommit,
        nodeRef,
    ]);

    return { handleResizePointerDown };
};
