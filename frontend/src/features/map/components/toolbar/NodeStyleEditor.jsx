import { useEffect, useState } from 'react';

import { Col, Row } from 'antd';

import { useMapContext } from '../../hooks';

import { ColorControl } from './ColorControl';
import { DimensionControl } from './DimensionControl';

export const NodeStyleEditor = () => {
    const { selectedNode, updateNodeStyle } = useMapContext();

    const [width, setWidth] = useState(null);
    const [height, setHeight] = useState(null);
    const [backgroundColor, setBackgroundColor] = useState('#ffffff');
    const [borderColor, setBorderColor] = useState('#808080');

    const parseDimension = (value) => {
        if (value === 'auto') return null;
        if (value && value.endsWith('px')) {
            return parseInt(value.slice(0, -2), 10);
        }
        return value;
    };

    useEffect(() => {
        if (selectedNode) {
            const { customSize, customColor } = selectedNode.data;

            setWidth(parseDimension(customSize?.width || 'auto'));
            setHeight(parseDimension(customSize?.height || 'auto'));

            setBackgroundColor(customColor?.backgroundColor || '#ffffff');
            setBorderColor(customColor?.borderColor || '#808080');
        }
    }, [selectedNode]);

    const isDisabled = !selectedNode;

    const handleDimensionUpdate = (field, value) => {
        if (!selectedNode) return;

        if (field === 'width') setWidth(value);
        if (field === 'height') setHeight(value);

        const processedValue = (value === null || value === undefined) ? 'auto' : `${value}px`;
        updateNodeStyle(selectedNode.id, {
            customSize: {
                ...selectedNode.data.customSize,
                [field]: processedValue,
            },
        });
    };

    const handleColorUpdate = (field, colorValue) => {
        if (!selectedNode) return;

        if (field === 'backgroundColor') setBackgroundColor(colorValue);
        if (field === 'borderColor') setBorderColor(colorValue);

        updateNodeStyle(selectedNode.id, {
            customColor: {
                ...selectedNode.data.customColor,
                [field]: colorValue,
            },
        });
    };

    return (
        <div style={{ padding: '8px' }}>
            <Row gutter={[8, 0]}>
                <Col span={12}>
                    <DimensionControl
                        label="Width"
                        value={width}
                        disabled={isDisabled}
                        onChange={(val) => handleDimensionUpdate('width', val)}
                        onAuto={() => handleDimensionUpdate('width', null)}
                    />
                </Col>

                <Col span={12}>
                    <DimensionControl
                        label="Height"
                        value={height}
                        disabled={isDisabled}
                        onChange={(val) => handleDimensionUpdate('height', val)}
                        onAuto={() => handleDimensionUpdate('height', null)}
                    />
                </Col>

                <Col span={12}>
                    <ColorControl
                        label="Background Color"
                        color={backgroundColor}
                        disabled={isDisabled}
                        onChange={(val) => handleColorUpdate('backgroundColor', val)}
                        onBlur={(val) => handleColorUpdate('backgroundColor', val, true)}
                    />
                </Col>

                <Col span={12}>
                    <ColorControl
                        label="Border Color"
                        color={borderColor}
                        disabled={isDisabled}
                        onChange={(val) => handleColorUpdate('borderColor', val)}
                        onBlur={(val) => handleColorUpdate('borderColor', val, true)}
                    />
                </Col>
            </Row>
        </div>
    );
};
