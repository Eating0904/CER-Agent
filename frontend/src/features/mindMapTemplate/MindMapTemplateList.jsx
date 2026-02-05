import { useEffect } from 'react';

import {
    Alert,
    App,
    Card,
    Col,
    Row,
    Spin,
    Tag,
    Tooltip,
} from 'antd';
import { useNavigate } from 'react-router-dom';

import taskImage from '../../assets/images/task.png';
import { formatDeadline } from '../../utils/templateDeadlineUtils';
import { useCreateMapFromTemplateMutation } from '../map/utils';
import { useUserActionTracker } from '../userAction/hooks';

import { useGetMindMapTemplatesQuery } from './mindMapTemplateApi';

import './MindMapTemplateManagement.css';

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
        if (!template.is_within_deadline) {
            message.warning('This task is not available');
            return;
        }

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
            {templates.map((template) => {
                const isActive = template.is_within_deadline;
                const cardContent = (
                    <Card
                        className="mind-map-card"
                        hoverable={isActive}
                        cover={(
                            <div
                                className="image-container"
                                style={{
                                    backgroundImage: `url(${taskImage})`,
                                }}
                            />
                        )}
                        onClick={isActive ? () => handleClick(template) : undefined}
                        style={{
                            width: '100%',
                            border: '1px solid #d9d9d9',
                            opacity: isActive ? 1 : 0.4,
                            cursor: isActive ? 'pointer' : 'not-allowed',
                        }}
                    >
                        <Meta
                            title={<div className="card-title">{template.name}</div>}
                            description={(
                                <>
                                    <div className="card-description">{template.issue_topic}</div>
                                    <div style={{ marginTop: '8px' }}>
                                        {template.created_by && (
                                            <Tag color="blue">
                                                Creator: {template.created_by.username}
                                            </Tag>
                                        )}
                                    </div>
                                    <div style={{ marginTop: '8px', fontSize: '12px' }}>
                                        <Tag color={isActive ? 'green' : 'error'}>
                                            {formatDeadline(template.start_date, template.end_date)}
                                        </Tag>
                                    </div>
                                </>
                            )}
                        />
                    </Card>
                );

                return (
                    <Col xs={24} sm={12} md={12} lg={6} xl={6} key={template.id} style={{ display: 'flex' }}>
                        {!isActive ? (
                            <Tooltip title="Not available">
                                {cardContent}
                            </Tooltip>
                        ) : (
                            cardContent
                        )}
                    </Col>
                );
            })}
        </Row>
    );
};
