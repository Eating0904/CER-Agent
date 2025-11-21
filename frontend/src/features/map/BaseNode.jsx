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
    const type = data.type || 'C';
    const content = data.content || '';
    const showDots = data.showDots || ['top', 'bottom'];
    const customColor = {
        backgroundColor: data.customColor?.backgroundColor || 'white',
        borderColor: data.customColor?.borderColor || 'gray',
    };
    const customFont = {
        color: data.customFont?.color || 'black',
        fontSize: data.customFont?.fontSize || '10px',
        fontWeight: data.customFont?.fontWeight || 'normal',
        textAlign: data.customFont?.textAlign || 'center',
    };
    const customSize = {
        width: data.customSize?.width || 'auto',
        height: data.customSize?.height || 'auto',
    };

    const getTypeColor = () => {
        switch (type) {
            case 'C':
                return '#49db88ff';
            case 'E':
                return '#f7be5dff';
            case 'R':
                return '#7cbeecff';
            default:
                return 'white';
        }
    };

    return (
        <div
            style={{
                position: 'relative',
                width: customSize.width,
                height: customSize.height,
                padding: '5px 8px',
                color: customFont.color,
                textAlign: customFont.textAlign,
                fontSize: customFont.fontSize,
                fontWeight: customFont.fontWeight,
                border: '1px solid',
                borderRadius: '5px',
                borderColor: customColor.borderColor,
                backgroundColor: customColor.backgroundColor,
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    top: '3px',
                    left: '3px',
                    width: '13px',
                    height: '13px',
                    borderRadius: '50%',
                    backgroundColor: getTypeColor(),
                    color: 'black',
                    fontSize: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                }}
            >
                {type}
            </div>
            <div style={{ paddingTop: '12px' }}>{content}</div>
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
                                background: customColor.borderColor,
                            }}
                        />
                    ))
            }
        </div>
    );
};
