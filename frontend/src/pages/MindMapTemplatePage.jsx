import { Col, Row, Typography } from 'antd';

import { EditMindMapTemplate } from '../features/teacher/EditMindMapTemplate';
import { MindMapTemplateList } from '../features/teacher/MindMapTemplateList';

import { Template } from './Template';

const { Title } = Typography;

export const MindMapTemplatePage = () => (
    <Template>
        <Title level={2} style={{ margin: '10px' }}>Mind Map Template</Title>
        <Row>
            <Col span={3} />
            <Col span={18}>
                <EditMindMapTemplate />
                <MindMapTemplateList />
            </Col>
            <Col span={3} />
        </Row>
    </Template>
);
