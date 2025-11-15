import { Col, Row, Typography } from 'antd';

import { MindMapTemplateManagement } from '../features/mindMapTemplate/MindMapTemplateManagement';

import { Template } from './Template';

const { Title } = Typography;

export const MindMapTemplateManagementPage = () => (
    <Template>
        <Title level={2} style={{ margin: '10px' }}>Mind Map Template Management</Title>
        <Row>
            <Col span={3} />
            <Col span={18}>
                <MindMapTemplateManagement />
            </Col>
            <Col span={3} />
        </Row>
    </Template>
);
