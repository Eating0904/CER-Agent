import { useEffect } from 'react';

import {
    Alert,
    App,
    Card,
    Col,
    Row,
    Spin,
    Tag,
} from 'antd';
import { useNavigate } from 'react-router-dom';

import { useCreateMapFromTemplateMutation } from '../map/utils';
import { useUserActionTracker } from '../userAction/hooks';

import { useGetMindMapTemplatesQuery } from './mindMapTemplateApi';

const { Meta } = Card;

export const MindMapTemplateList = () => {
    const { message } = App.useApp();
    const navigate = useNavigate();
    const { data: templates = [], isLoading, error } = useGetMindMapTemplatesQuery();
    const [createMapFromTemplate, { isLoading: isCreating }] = useCreateMapFromTemplateMutation();
    const { trackAction } = useUserActionTracker();

    useEffect(() => {
        if (error) {
            console.error('Failed to load tasks:', error);
        }
    }, [error]);

    const handleClick = async (template) => {
        try {
            const result = await createMapFromTemplate({
                template_id: template.id,
            }).unwrap();

            // 記錄新增 map 行為
            await trackAction('create_map', {
                template_id: template.id,
                map_name: result.name,
            }, result.id);

            message.success('Task created successfully');
            navigate(`/map?mapId=${result.id}`);
        }
        catch (err) {
            message.error('Operation failed');
            console.error('Failed to create task:', err);
        }
    };

    if (isLoading || isCreating) {
        return (
            <Spin size="large" tip={isCreating ? 'Creating Task...' : 'Loading...'}>
                <div style={{ textAlign: 'center', padding: '50px' }} />
            </Spin>
        );
    }

    if (error) {
        return (
            <Alert
                message="Error"
                description="Failed to load tasks. Please try again later."
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
                            description={(
                                <>
                                    <div className="card-description">{template.issue_topic}</div>
                                    {template.created_by && (
                                        <div>
                                            <Tag color="blue">
                                                Creator: {template.created_by.username}
                                            </Tag>
                                        </div>
                                    )}
                                </>
                            )}
                        />
                    </Card>
                </Col>
            ))}
        </Row>
    );
};
