import { Col, Row, Typography } from 'antd';

import { MindMapTemplateManagement } from '../features/mindMapTemplate/MindMapTemplateManagement';

const { Title } = Typography;

export const MindMapTemplateManagementPage = () => (
    <>
        <Title level={2} style={{ margin: '10px' }}>Task Management</Title>
        <Row>
            <Col span={3} />
            <Col span={18}>
                <MindMapTemplateManagement />
            </Col>
            <Col span={3} />
        </Row>
    </>
);
