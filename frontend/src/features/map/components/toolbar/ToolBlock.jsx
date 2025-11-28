import { useEffect, useState } from 'react';

import { CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons';
import { Button, Col, Row } from 'antd';

import { AddNodeButton } from './AddNodeButton';
import { ExpandableInput } from './ExpandableInput';
import { FontStyleEditor } from './FontStyleEditor';
import { NodeStyleEditor } from './NodeStyleEditor';

const TOOLBLOCK_STORAGE_KEY = 'toolblock-collapsed';

export const ToolBlock = () => {
    const collapsedHeight = 30;
    const expandedHeight = 125;

    const [isCollapsed, setIsCollapsed] = useState(() => {
        const saved = localStorage.getItem(TOOLBLOCK_STORAGE_KEY);
        return saved ? JSON.parse(saved) : false;
    });

    useEffect(() => {
        localStorage.setItem(TOOLBLOCK_STORAGE_KEY, JSON.stringify(isCollapsed));
    }, [isCollapsed]);

    return (
        <div
            style={{
                height: isCollapsed ? `${collapsedHeight}px` : `${expandedHeight}px`,
                width: '100%',
                backgroundColor: '#f5f5f5',
                borderBottom: '1px solid #d9d9d9',
                overflow: 'hidden',
            }}
        >
            <Row style={{ height: '100%' }} wrap={false} gutter={0}>
                <Col flex="auto">
                    <div
                        style={{
                            height: '100%',
                            overflowY: 'hidden',
                        }}
                    >
                        {!isCollapsed && (
                            <Row gutter={0}>
                                <Col span={3}>
                                    <AddNodeButton />
                                </Col>
                                <Col span={7} style={{ position: 'static', zIndex: 1 }}>
                                    <ExpandableInput />
                                </Col>
                                <Col span={4} style={{ padding: '8px' }}>
                                    <span style={{ fontWeight: '500', fontSize: '14px' }}>Font Style</span>
                                    <FontStyleEditor />
                                </Col>
                                <Col span={5} style={{ padding: '8px' }}>
                                    <span style={{ fontWeight: '500', fontSize: '14px' }}>Node Style</span>
                                    <NodeStyleEditor />
                                </Col>
                                <Col span={5} />
                            </Row>
                        )}
                    </div>
                </Col>
                <Col
                    flex="32px"
                    style={{
                        height: '100%',
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'center',
                    }}
                >
                    <Button
                        type="text"
                        icon={isCollapsed ? <CaretDownOutlined /> : <CaretUpOutlined />}
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        size="small"
                    />
                </Col>
            </Row>
        </div>
    );
};
