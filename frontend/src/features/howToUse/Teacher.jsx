import { useRef } from 'react';

import {
    Col,
    Divider,
    Row,
    Typography,
} from 'antd';

import { Permissions } from './Permissions';
import { SectionNav } from './SectionNav';
import { Task } from './Tasks';

const { Title } = Typography;

const SECTIONS = [
    { key: 'permissions', label: 'Permissions' },
    { key: 'task', label: 'Task' },
];

// 左側寬度：10.4% ≈ 2.5/24
const NAV_COL_STYLE = { flex: '0 0 10.4%', maxWidth: '10.4%' };
const CONTENT_COL_STYLE = { flex: 1, padding: '32px', textAlign: 'start', height: '100%', overflowY: 'auto' };

export const Teacher = () => {
    const sectionRefs = useRef({});

    return (
        <Row style={{ height: '100%', background: '#fff', flexWrap: 'nowrap' }}>
            <Col style={NAV_COL_STYLE}>
                <SectionNav sections={SECTIONS} sectionRefs={sectionRefs} />
            </Col>
            <Col style={CONTENT_COL_STYLE}>
                <div
                    ref={(el) => {
                        sectionRefs.current.permissions = el;
                    }}
                />
                <Title level={3}>Permissions</Title>
                <Permissions />
                <Divider size="middle" style={{ borderColor: '#e5d6f8', borderWidth: 2 }} />

                <div
                    ref={(el) => {
                        sectionRefs.current.task = el;
                    }}
                />
                <Title level={3}>Task</Title>
                <Task />
            </Col>
        </Row>
    );
};
