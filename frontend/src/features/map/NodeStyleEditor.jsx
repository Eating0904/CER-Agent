import { useEffect, useState } from 'react';

import { RobotOutlined } from '@ant-design/icons';
import {
    Button,
    Col,
    Form,
    Input,
    InputNumber,
    Popover,
    Row,
} from 'antd';
import { TwitterPicker } from 'react-color';

import { useMapContext } from './useMapContext';

export const NodeStyleEditor = () => {
    const { selectedNode, updateNodeStyle } = useMapContext();
    const [form] = Form.useForm();
    const [bgColorPickerVisible, setBgColorPickerVisible] = useState(false);
    const [borderColorPickerVisible, setBorderColorPickerVisible] = useState(false);

    const backgroundColor = Form.useWatch('backgroundColor', form);
    const borderColor = Form.useWatch('borderColor', form);

    useEffect(() => {
        if (selectedNode) {
            const width = selectedNode.data.customSize?.width || 'auto';
            const height = selectedNode.data.customSize?.height || 'auto';

            const displayWidth = width === 'auto' ? null
                : (width && width.endsWith('px') ? parseInt(width.slice(0, -2), 10) : width);
            const displayHeight = height === 'auto' ? null
                : (height && height.endsWith('px') ? parseInt(height.slice(0, -2), 10) : height);

            form.setFieldsValue({
                width: displayWidth,
                height: displayHeight,
                backgroundColor: selectedNode.data.customColor?.backgroundColor || '#ffffff',
                borderColor: selectedNode.data.customColor?.borderColor || '#808080',
            });
        }
    }, [selectedNode, form]);

    const handleSizeChange = (field, value) => {
        if (!selectedNode) return;

        const processedValue = (value === null || value === undefined) ? 'auto' : `${value}px`;

        updateNodeStyle(selectedNode.id, {
            customSize: {
                ...selectedNode.data.customSize,
                [field]: processedValue,
            },
        });
    };

    const handleBlur = (field) => {
        if (!selectedNode) return;

        const value = form.getFieldValue(field);

        if (field === 'backgroundColor' || field === 'borderColor') {
            updateNodeStyle(selectedNode.id, {
                customColor: {
                    ...selectedNode.data.customColor,
                    [field]: value,
                },
            });
        }
    };

    const handleColorChange = (field, color) => {
        if (!selectedNode) return;

        const hexColor = color.hex;
        form.setFieldValue(field, hexColor);

        updateNodeStyle(selectedNode.id, {
            customColor: {
                ...selectedNode.data.customColor,
                [field]: hexColor,
            },
        });
    };

    const setAutoWidth = () => {
        if (!selectedNode) return;
        form.setFieldValue('width', 'auto');
        updateNodeStyle(selectedNode.id, {
            customSize: {
                ...selectedNode.data.customSize,
                width: 'auto',
            },
        });
    };

    const setAutoHeight = () => {
        if (!selectedNode) return;
        form.setFieldValue('height', 'auto');
        updateNodeStyle(selectedNode.id, {
            customSize: {
                ...selectedNode.data.customSize,
                height: 'auto',
            },
        });
    };

    const isDisabled = !selectedNode;

    return (
        <div style={{ padding: '8px' }}>
            <style>{`
                .node-style-editor .ant-form-item-label {
                    padding: 0 !important;
                }
            `}
            </style>
            <Form
                form={form}
                layout="vertical"
                size="small"
                colon={false}
                className="node-style-editor"
            >
                <Row gutter={[8, 0]}>
                    <Col span={12}>
                        <Form.Item
                            label={(
                                <span>
                                    Width
                                    <Button
                                        icon={<RobotOutlined />}
                                        onClick={setAutoWidth}
                                        size="small"
                                        type="text"
                                        disabled={isDisabled}
                                    />
                                </span>
                            )}
                            name="width"
                            style={{ margin: 0 }}
                        >
                            <InputNumber
                                placeholder="auto"
                                disabled={isDisabled}
                                onChange={(value) => handleSizeChange('width', value)}
                                style={{ width: '100%' }}
                                min={0}
                                controls={false}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label={(
                                <span>
                                    Height
                                    <Button
                                        icon={<RobotOutlined />}
                                        onClick={setAutoHeight}
                                        size="small"
                                        type="text"
                                        disabled={isDisabled}
                                    />
                                </span>
                            )}
                            name="height"
                            style={{ margin: 0 }}
                        >
                            <InputNumber
                                placeholder="auto"
                                disabled={isDisabled}
                                onChange={(value) => handleSizeChange('height', value)}
                                style={{ width: '100%' }}
                                min={0}
                                controls={false}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Background Color"
                            name="backgroundColor"
                            style={{ margin: 0 }}
                        >
                            <Input
                                placeholder={form.getFieldValue('backgroundColor') || '#ffffff'}
                                disabled={isDisabled}
                                onBlur={() => handleBlur('backgroundColor')}
                                suffix={(
                                    <Popover
                                        content={(
                                            <TwitterPicker
                                                color={backgroundColor}
                                                onChange={(color) => handleColorChange('backgroundColor', color)}
                                                triangle="hide"
                                            />
                                        )}
                                        trigger="click"
                                        open={bgColorPickerVisible && !isDisabled}
                                        onOpenChange={
                                            (visible) => !isDisabled
                                            && setBgColorPickerVisible(visible)
                                        }
                                    >
                                        <div
                                            style={{
                                                width: '20px',
                                                height: '20px',
                                                borderRadius: '2px',
                                                backgroundColor: backgroundColor || '#ffffff',
                                                border: '1px solid #d9d9d9',
                                                cursor: isDisabled ? 'not-allowed' : 'pointer',
                                            }}
                                        />
                                    </Popover>
                                )}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Border Color"
                            name="borderColor"
                            style={{ margin: 0, padding: 0 }}
                        >
                            <Input
                                placeholder={form.getFieldValue('borderColor') || '#808080'}
                                disabled={isDisabled}
                                onBlur={() => handleBlur('borderColor')}
                                suffix={(
                                    <Popover
                                        content={(
                                            <TwitterPicker
                                                color={borderColor}
                                                onChange={(color) => handleColorChange('borderColor', color)}
                                                triangle="hide"
                                            />
                                        )}
                                        trigger="click"
                                        open={borderColorPickerVisible && !isDisabled}
                                        onOpenChange={
                                            (visible) => !isDisabled
                                            && setBorderColorPickerVisible(visible)
                                        }
                                    >
                                        <div
                                            style={{
                                                width: '20px',
                                                height: '20px',
                                                borderRadius: '2px',
                                                backgroundColor: borderColor || '#808080',
                                                border: '1px solid #d9d9d9',
                                                cursor: isDisabled ? 'not-allowed' : 'pointer',
                                            }}
                                        />
                                    </Popover>
                                )}
                            />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </div>
    );
};
