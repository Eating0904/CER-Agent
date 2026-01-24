import { useEffect, useState } from 'react';

import { Col, Flex, Row } from 'antd';
import { useSearchParams } from 'react-router-dom';

import { DEFAULT_COLORS } from '../../../../constants/colors';
import { useUserActionTracker } from '../../../userAction/hooks';
import { useMapContext } from '../../hooks';

import { ColorControl } from './ColorControl';
import { DimensionControl } from './DimensionControl';
import { backgroundColorIcon, borderColorIcon } from './IconSvg';

export const NodeStyleEditor = () => {
    const { selectedNode, updateNodeStyle } = useMapContext();
    const [searchParams] = useSearchParams();
    const mapId = searchParams.get('mapId');
    const { trackAction } = useUserActionTracker();

    const [width, setWidth] = useState(null);
    const [height, setHeight] = useState(null);
    const [backgroundColor, setBackgroundColor] = useState(DEFAULT_COLORS.backgroundColor);
    const [borderColor, setBorderColor] = useState(DEFAULT_COLORS.borderColor);

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

            setBackgroundColor(customColor?.backgroundColor || DEFAULT_COLORS.backgroundColor);
            setBorderColor(customColor?.borderColor || DEFAULT_COLORS.borderColor);
        }
    }, [selectedNode]);

    const isDisabled = !selectedNode;

    const handleDimensionUpdate = (field, value) => {
        if (!selectedNode) return;

        // 只更新本地 state
        if (field === 'width') setWidth(value);
        if (field === 'height') setHeight(value);
    };

    const handleDimensionBlur = (field) => {
        if (!selectedNode) return;

        const value = field === 'width' ? width : height;
        const processedValue = (value === null || value === undefined) ? 'auto' : `${value}px`;

        updateNodeStyle(selectedNode.id, {
            customSize: {
                ...selectedNode.data.customSize,
                [field]: processedValue,
            },
        });

        trackAction('adjust_node_style', {
            node_id: selectedNode.id,
            property_type: field,
        }, mapId ? parseInt(mapId, 10) : null);
    };

    const handleDimensionAuto = (field) => {
        if (!selectedNode) return;

        if (field === 'width') setWidth(null);
        if (field === 'height') setHeight(null);

        updateNodeStyle(selectedNode.id, {
            customSize: {
                ...selectedNode.data.customSize,
                [field]: 'auto',
            },
        });

        trackAction('adjust_node_style', {
            node_id: selectedNode.id,
            property_type: field,
        }, mapId ? parseInt(mapId, 10) : null);
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

    const handleColorBlur = (field) => {
        if (!selectedNode) return;

        // 只在 blur 時記錄
        trackAction('adjust_node_style', {
            node_id: selectedNode.id,
            property_type: field,
        }, mapId ? parseInt(mapId, 10) : null);
    };

    return (
        <div style={{ height: 'calc(100% - 19px)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Row gutter={16}>
                <Col span={12}>
                    <Flex vertical gap="middle">
                        <DimensionControl
                            label="W:"
                            placeholder="Width"
                            value={width}
                            disabled={isDisabled}
                            onChange={(val) => handleDimensionUpdate('width', val)}
                            onBlur={() => handleDimensionBlur('width')}
                            onAuto={() => handleDimensionAuto('width')}
                        />
                        <DimensionControl
                            label="H:"
                            placeholder="Height"
                            value={height}
                            disabled={isDisabled}
                            onChange={(val) => handleDimensionUpdate('height', val)}
                            onBlur={() => handleDimensionBlur('height')}
                            onAuto={() => handleDimensionAuto('height')}
                        />

                    </Flex>
                </Col>
                <Col span={12}>
                    <Flex vertical gap="middle">
                        <ColorControl
                            icon={backgroundColorIcon}
                            placeholder="Background Color"
                            color={backgroundColor}
                            disabled={isDisabled}
                            onChange={(val) => handleColorUpdate('backgroundColor', val)}
                            onBlur={() => handleColorBlur('backgroundColor')}
                        />
                        <ColorControl
                            icon={borderColorIcon}
                            placeholder="Border Color"
                            color={borderColor}
                            disabled={isDisabled}
                            onChange={(val) => handleColorUpdate('borderColor', val)}
                            onBlur={() => handleColorBlur('borderColor')}
                        />
                    </Flex>
                </Col>
            </Row>
        </div>
    );
};
