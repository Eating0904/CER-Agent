import { useRef } from 'react';

import { Handle, Position } from '@xyflow/react';

import {
    getNodeColorByType,
    NEUTRAL_COLORS,
    NODE_COLORS,
    SHADOW_COLORS,
} from '../../../../constants/colors';
import { useMapContext, useNodeResize } from '../../hooks';

const BASE_NODE_HANDLES_DEFINITION = [
    { id: 'top', position: Position.Top },
    { id: 'topLeft', position: Position.Top, style: { left: '25%' } },
    { id: 'topRight', position: Position.Top, style: { left: '75%' } },
    { id: 'bottom', position: Position.Bottom },
    { id: 'bottomLeft', position: Position.Bottom, style: { left: '25%' } },
    { id: 'bottomRight', position: Position.Bottom, style: { left: '75%' } },
    { id: 'left', position: Position.Left },
    { id: 'right', position: Position.Right },
];

// 8 個 resize handle：dir.x/y 表示各邊界的移動方向
const HANDLE_OFFSET = 25;
const RESIZE_HANDLES = [
    { id: 'nw', style: { top: -HANDLE_OFFSET, left: -HANDLE_OFFSET, cursor: 'nw-resize' }, dir: { x: -1, y: -1 } },
    { id: 'n', style: { top: -HANDLE_OFFSET, left: '50%', transform: 'translateX(-50%)', cursor: 'n-resize' }, dir: { x: 0, y: -1 } },
    { id: 'ne', style: { top: -HANDLE_OFFSET, right: -HANDLE_OFFSET, cursor: 'ne-resize' }, dir: { x: 1, y: -1 } },
    { id: 'e', style: { top: '50%', right: -HANDLE_OFFSET, transform: 'translateY(-50%)', cursor: 'e-resize' }, dir: { x: 1, y: 0 } },
    { id: 'se', style: { bottom: -HANDLE_OFFSET, right: -HANDLE_OFFSET, cursor: 'se-resize' }, dir: { x: 1, y: 1 } },
    { id: 's', style: { bottom: -HANDLE_OFFSET, left: '50%', transform: 'translateX(-50%)', cursor: 's-resize' }, dir: { x: 0, y: 1 } },
    { id: 'sw', style: { bottom: -HANDLE_OFFSET, left: -HANDLE_OFFSET, cursor: 'sw-resize' }, dir: { x: -1, y: 1 } },
    { id: 'w', style: { top: '50%', left: -HANDLE_OFFSET, transform: 'translateY(-50%)', cursor: 'w-resize' }, dir: { x: -1, y: 0 } },
];

export const BaseNode = ({
    data, id, positionAbsoluteX, positionAbsoluteY,
}) => {
    const { selectedNodeId } = useMapContext();
    const isSelected = selectedNodeId === id;

    const nodeRef = useRef(null);
    const { handleResizePointerDown } = useNodeResize(
        id,
        positionAbsoluteX,
        positionAbsoluteY,
        nodeRef,
    );

    const type = data.type || 'C';
    const content = data.content || '';
    const showDots = data.showDots || ['top', 'bottom'];
    const customColor = {
        backgroundColor: data.customColor?.backgroundColor || NODE_COLORS.default,
        borderColor: data.customColor?.borderColor || NODE_COLORS.defaultBorder,
    };
    const customFont = {
        color: data.customFont?.color || NEUTRAL_COLORS.black,
        fontSize: data.customFont?.fontSize || '12px',
        fontWeight: data.customFont?.fontWeight || 'normal',
        textAlign: data.customFont?.textAlign || 'center',
        fontStyle: data.customFont?.fontStyle || 'normal',
        textDecoration: data.customFont?.textDecoration || 'none',
    };
    const customSize = {
        width: data.customSize?.width || 'auto',
        height: data.customSize?.height || 'auto',
    };

    const getTypeColor = () => getNodeColorByType(type);

    return (
        <div
            ref={nodeRef}
            style={{
                position: 'relative',
                overflow: 'visible',
                width: customSize.width,
                height: customSize.height,
                padding: '5px 8px',
                color: customFont.color,
                textAlign: customFont.textAlign,
                fontSize: customFont.fontSize,
                fontWeight: customFont.fontWeight,
                fontStyle: customFont.fontStyle,
                textDecoration: customFont.textDecoration,
                border: '1px solid',
                borderRadius: '5px',
                borderColor: customColor.borderColor,
                backgroundColor: customColor.backgroundColor,
                boxShadow: isSelected ? SHADOW_COLORS.selectedHighlight : 'none',
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    top: '3px',
                    left: '3px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: getTypeColor(),
                    color: NEUTRAL_COLORS.black,
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                }}
            >
                {id}
            </div>
            <div
                style={{
                    paddingTop: '20px',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                }}
            >
                {content}
            </div>

            {isSelected && RESIZE_HANDLES.map((handle) => (
                <div
                    key={handle.id}
                    onPointerDown={(e) => handleResizePointerDown(e, handle.dir)}
                    style={{
                        position: 'absolute',
                        width: 8,
                        height: 8,
                        borderRadius: 2,
                        backgroundColor: '#fff',
                        border: `2px solid ${customColor.borderColor}`,
                        boxSizing: 'border-box',
                        zIndex: 10,
                        ...handle.style,
                    }}
                />
            ))}

            {
                BASE_NODE_HANDLES_DEFINITION
                    .filter((handleDef) => showDots.includes(handleDef.id))
                    .map((handleDef) => (
                        <Handle
                            key={handleDef.id}
                            id={handleDef.id}
                            type="source"
                            position={handleDef.position}
                            style={{
                                ...handleDef.style,
                                width: 10,
                                height: 10,
                                background: customColor.borderColor,
                            }}
                        />
                    ))
            }
        </div>
    );
};
