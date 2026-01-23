import {
    Alert,
    App,
    Card,
    Col,
    Row,
    Spin,
} from 'antd';
import { useNavigate } from 'react-router-dom';

import { useCreateMapFromTemplateMutation } from '../map/utils';

import { useGetMindMapTemplatesQuery } from './mindMapTemplateApi';

const { Meta } = Card;

export const MindMapTemplateList = () => {
    const { message } = App.useApp();
    const navigate = useNavigate();
    const { data: templates = [], isLoading, error } = useGetMindMapTemplatesQuery();
    const [createMapFromTemplate, { isLoading: isCreating }] = useCreateMapFromTemplateMutation();

    const handleClick = async (template) => {
        try {
            const result = await createMapFromTemplate({
                template_id: template.id,
            }).unwrap();

            message.success('Mind map created successfully');
            navigate(`/map?mapId=${result.id}`);
        }
        catch (err) {
            message.error('Operation failed');
            console.error('Failed to create mind map:', err);
        }
    };

    if (isLoading || isCreating) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" tip={isCreating ? '建立地圖中...' : '載入中...'} />
            </div>
        );
    }

    if (error) {
        return (
            <Alert
                message="Error"
                description="Failed to load mind map templates. Please try again later."
                type="error"
                showIcon
            />
        );
    }

    return (
        <Row gutter={[16, 16]} justify="start">
            {templates.map((template) => (
                <Col xs={24} sm={12} md={12} lg={6} xl={6} key={template.id} style={{ display: 'flex' }}>
                    <Card
                        className="mind-map-card"
                        hoverable
                        cover={(
                            <div
                                className="image-container"
                                style={{
                                    backgroundImage: 'url(https://www.shutterstock.com/image-vector/mind-map-template-round-strokes-260nw-2589169071.jpg)',
                                }}
                            />
                        )}
                        onClick={() => handleClick(template)}
                        style={{ width: '100%', border: '1px solid #d9d9d9' }}
                    >
                        <Meta
                            title={<div className="card-title">{template.name}</div>}
                            description={<div className="card-description">{template.issue_topic}</div>}
                        />
                    </Card>
                </Col>
            ))}
        </Row>
    );
};
