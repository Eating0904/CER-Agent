import { Col, Row, Typography } from 'antd';

import { MindMapTemplateList } from '../features/mindMapTemplate/MindMapTemplateList';

const { Title } = Typography;

export const MindMapTemplateListPage = () => (
    <>
        <Title level={2} style={{ margin: '10px' }}>Task List</Title>
        <Row>
            <Col span={3} />
            <Col span={18}>
                <MindMapTemplateList />
            </Col>
            <Col span={3} />
        </Row>
    </>
);
