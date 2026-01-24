import { useEffect, useState } from 'react';

import {
    AlignCenterOutlined,
    AlignLeftOutlined,
    AlignRightOutlined,
    BoldOutlined,
    ItalicOutlined,
    UnderlineOutlined,
} from '@ant-design/icons';
import {
    Button,
    Col,
    Flex,
    Row,
} from 'antd';
import { useSearchParams } from 'react-router-dom';

import { DEFAULT_COLORS } from '../../../../constants/colors';
import { useUserActionTracker } from '../../../userAction/hooks';
import { useMapContext } from '../../hooks';

import { ColorControl } from './ColorControl';
import { DimensionControl } from './DimensionControl';
import { fontColorIcon } from './IconSvg';

export const FontStyleEditor = () => {
    const { selectedNode, updateNodeStyle } = useMapContext();
    const [searchParams] = useSearchParams();
    const mapId = searchParams.get('mapId');
    const { trackAction } = useUserActionTracker();

    const [color, setColor] = useState(DEFAULT_COLORS.fontColor);
    const [fontSize, setFontSize] = useState(null);
    const [fontWeight, setFontWeight] = useState(false);
    const [fontStyle, setFontStyle] = useState(false);
    const [textDecoration, setTextDecoration] = useState(false);
    const [textAlign, setTextAlign] = useState('center');

    const parseFontSize = (value) => {
        if (!value) return null;
        if (typeof value === 'string' && value.endsWith('px')) {
            return parseInt(value.slice(0, -2), 10);
        }
        const parsed = parseInt(value, 10);
        return Number.isNaN(parsed) ? null : parsed;
    };

    useEffect(() => {
        if (selectedNode) {
            const { customFont } = selectedNode.data;

            setColor(customFont?.color || DEFAULT_COLORS.fontColor);
            setFontSize(parseFontSize(customFont?.fontSize));
            setFontWeight(customFont?.fontWeight === 'bold' || customFont?.fontWeight === 700);
            setFontStyle(customFont?.fontStyle === 'italic');
            setTextDecoration(customFont?.textDecoration === 'underline');
            setTextAlign(customFont?.textAlign || 'center');
        }
    }, [selectedNode]);

    const isDisabled = !selectedNode;

    const handleColorUpdate = (colorValue) => {
        if (!selectedNode) return;

        setColor(colorValue);

        updateNodeStyle(selectedNode.id, {
            customFont: {
                ...selectedNode.data.customFont,
                color: colorValue,
            },
        });

        // 記錄調整字體樣式
        trackAction('adjust_font_style', {
            node_id: selectedNode.id,
            property_type: 'color',
        }, mapId ? parseInt(mapId, 10) : null);
    };

    const handleFontSizeUpdate = (value) => {
        if (!selectedNode) return;
        // 只更新本地 state，不更新樣式
        setFontSize(value);
    };

    const handleFontSizeBlur = () => {
        if (!selectedNode) return;

        // blur 時才更新樣式並記錄行為
        updateNodeStyle(selectedNode.id, {
            customFont: {
                ...selectedNode.data.customFont,
                fontSize: fontSize ? `${fontSize}px` : undefined,
            },
        });

        trackAction('adjust_font_style', {
            node_id: selectedNode.id,
            property_type: 'fontSize',
        }, mapId ? parseInt(mapId, 10) : null);
    };

    const handleFontWeightUpdate = (isBold) => {
        if (!selectedNode) return;

        setFontWeight(isBold);

        updateNodeStyle(selectedNode.id, {
            customFont: {
                ...selectedNode.data.customFont,
                fontWeight: isBold ? 'bold' : 'normal',
            },
        });

        trackAction('adjust_font_style', {
            node_id: selectedNode.id,
            property_type: 'fontWeight',
        }, mapId ? parseInt(mapId, 10) : null);
    };

    const handleFontStyleUpdate = (isItalic) => {
        if (!selectedNode) return;

        setFontStyle(isItalic);

        updateNodeStyle(selectedNode.id, {
            customFont: {
                ...selectedNode.data.customFont,
                fontStyle: isItalic ? 'italic' : 'normal',
            },
        });

        trackAction('adjust_font_style', {
            node_id: selectedNode.id,
            property_type: 'fontStyle',
        }, mapId ? parseInt(mapId, 10) : null);
    };

    const handleTextDecorationUpdate = (isUnderline) => {
        if (!selectedNode) return;

        setTextDecoration(isUnderline);

        updateNodeStyle(selectedNode.id, {
            customFont: {
                ...selectedNode.data.customFont,
                textDecoration: isUnderline ? 'underline' : 'none',
            },
        });

        trackAction('adjust_font_style', {
            node_id: selectedNode.id,
            property_type: 'textDecoration',
        }, mapId ? parseInt(mapId, 10) : null);
    };

    const handleTextAlignUpdate = (value) => {
        if (!selectedNode) return;

        setTextAlign(value);

        updateNodeStyle(selectedNode.id, {
            customFont: {
                ...selectedNode.data.customFont,
                textAlign: value,
            },
        });

        trackAction('adjust_font_style', {
            node_id: selectedNode.id,
            property_type: 'textAlign',
        }, mapId ? parseInt(mapId, 10) : null);
    };

    return (
        <div style={{ height: 'calc(100% - 19px)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Row gutter={16}>
                <Col span={14}>
                    <Flex vertical gap="middle">
                        <DimensionControl
                            placeholder="Font Size"
                            value={fontSize}
                            disabled={isDisabled}
                            onChange={handleFontSizeUpdate}
                            onBlur={handleFontSizeBlur}
                            showAutoButton={false}
                        />
                        <ColorControl
                            label="Font Color"
                            placeholder="Font Color"
                            icon={fontColorIcon}
                            color={color}
                            disabled={isDisabled}
                            onChange={handleColorUpdate}
                            onBlur={handleColorUpdate}
                        />
                    </Flex>
                </Col>

                <Col span={10}>
                    <Flex vertical gap="middle">
                        <Flex gap="small">
                            <Button
                                icon={<BoldOutlined />}
                                type={fontWeight ? 'primary' : 'default'}
                                disabled={isDisabled}
                                onClick={() => handleFontWeightUpdate(!fontWeight)}
                                size="small"
                            />
                            <Button
                                icon={<ItalicOutlined />}
                                type={fontStyle ? 'primary' : 'default'}
                                disabled={isDisabled}
                                onClick={() => handleFontStyleUpdate(!fontStyle)}
                                size="small"
                            />
                            <Button
                                icon={<UnderlineOutlined />}
                                type={textDecoration ? 'primary' : 'default'}
                                disabled={isDisabled}
                                onClick={() => handleTextDecorationUpdate(!textDecoration)}
                                size="small"
                            />
                        </Flex>

                        <Flex gap="small">
                            <Button
                                icon={<AlignLeftOutlined />}
                                type={textAlign === 'left' ? 'primary' : 'default'}
                                disabled={isDisabled}
                                onClick={() => handleTextAlignUpdate('left')}
                                size="small"
                            />
                            <Button
                                icon={<AlignCenterOutlined />}
                                type={textAlign === 'center' ? 'primary' : 'default'}
                                disabled={isDisabled}
                                onClick={() => handleTextAlignUpdate('center')}
                                size="small"
                            />
                            <Button
                                icon={<AlignRightOutlined />}
                                type={textAlign === 'right' ? 'primary' : 'default'}
                                disabled={isDisabled}
                                onClick={() => handleTextAlignUpdate('right')}
                                size="small"
                            />
                        </Flex>
                    </Flex>
                </Col>
            </Row>
        </div>
    );
};
