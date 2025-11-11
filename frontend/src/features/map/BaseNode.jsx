import { Handle, Position } from '@xyflow/react';

const BASE_NODE_HANDLES_DEFINITION = [
    { id: 'top', position: Position.Top },
    { id: 'top-left', position: Position.Top, style: { left: '25%' } },
    { id: 'top-right', position: Position.Top, style: { left: '75%' } },
    { id: 'bottom', position: Position.Bottom },
    { id: 'bottom-left', position: Position.Bottom, style: { left: '25%' } },
    { id: 'bottom-right', position: Position.Bottom, style: { left: '75%' } },
    { id: 'left', position: Position.Left },
    { id: 'right', position: Position.Right },
];

export const BaseNode = ({ data }) => {
    const content = data.content || '';
    const showDots = data.showDots || ['top', 'bottom'];
    const customColor = data.customColor || {
        color: 'black',
        backgroundColor: 'white',
        borderColor: 'black',
        dotColor: 'gray',
    };
    const customFont = data.customFont || {
        fontSize: '10px',
        fontWeight: 'normal',
        textAlign: 'center',
    };
    const customSize = data.customSize || {
        width: 'auto',
        height: 'auto',
    };

    return (
        <div
            style={{
                width: customSize.width,
                height: customSize.height,
                padding: '5px 10px',
                color: customColor.color,
                textAlign: customFont.textAlign,
                fontSize: customFont.fontSize,
                fontWeight: customFont.fontWeight,
                border: '1px solid',
                borderRadius: '5px',
                borderColor: customColor.borderColor,
                backgroundColor: customColor.backgroundColor,
            }}
        >
            <div>{content}</div>
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
                                background: customColor.dotColor,
                            }}
                        />
                    ))
            }
        </div>
    );
};
