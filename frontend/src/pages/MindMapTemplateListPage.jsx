import { Col, Row, Typography } from 'antd';

import { MindMapTemplateList } from '../features/mindMapTemplate/MindMapTemplateList';

import { Template } from './Template';

const { Title } = Typography;

export const MindMapTemplateListPage = () => (
    <Template>
        <Title level={2} style={{ margin: '10px' }}>Mind Map List</Title>
        <Row>
            <Col span={3} />
            <Col span={18}>
                <MindMapTemplateList />
            </Col>
            <Col span={3} />
        </Row>
    </Template>
);
