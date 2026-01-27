import { useEffect, useState } from 'react';

import {
    DeleteOutlined,
    EditOutlined,
    TeamOutlined,
} from '@ant-design/icons';
import {
    Alert,
    App,
    Button,
    Card,
    Col,
    Modal,
    Row,
    Spin,
    Tag,
} from 'antd';

import { useGetMeQuery } from '../user/userApi';

import { EditMindMapTemplate } from './EditMindMapTemplate';
import { ManageAssistants } from './ManageAssistants';
import {
    useDeleteMindMapTemplateMutation,
    useGetMyMindMapTemplatesQuery,
} from './mindMapTemplateApi';

import './MindMapTemplateManagement.css';

const { Meta } = Card;

export const MindMapTemplateManagement = () => {
    const { message } = App.useApp();
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [managingTemplate, setManagingTemplate] = useState(null);
    const [isManageAssistantsOpen, setIsManageAssistantsOpen] = useState(false);

    const { data: currentUser } = useGetMeQuery();
    const { data: templates = [], isLoading, error } = useGetMyMindMapTemplatesQuery();
    const [deleteTemplate] = useDeleteMindMapTemplateMutation();

    useEffect(() => {
        if (error) {
            console.error('Failed to load my tasks:', error);
        }
    }, [error]);

    const handleEdit = (templateId) => {
        const template = templates.find((t) => t.id === templateId);
        if (template) {
            setEditingTemplate({
                id: template.id,
                name: template.name,
                issueTopic: template.issue_topic,
                articleContent: template.article_content,
            });
            setIsEditModalOpen(true);
        }
    };

    const handleDelete = (templateId, templateName) => {
        Modal.confirm({
            title: 'Delete Task',
            content: `Are you sure you want to delete "${templateName}"?`,
            okText: 'Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    await deleteTemplate(templateId).unwrap();
                    message.success('Task deleted successfully!');
                }
                catch (err) {
                    message.error('Failed to delete task.');
                    console.error('Failed to delete task:', err);
                }
            },
        });
    };

    const handleManageAssistants = (template) => {
        setManagingTemplate(template);
        setIsManageAssistantsOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditingTemplate(null);
    };

    const handleCloseManageAssistants = () => {
        setIsManageAssistantsOpen(false);
        setManagingTemplate(null);
    };

    if (isLoading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
            </div>
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

    const isAssistant = currentUser?.role === 'assistant';

    return (
        <>
            {!isAssistant && <EditMindMapTemplate />}
            <Row gutter={[16, 16]} justify="start">
                {templates.map((template) => (
                    <Col xs={24} sm={12} md={12} lg={6} xl={6} key={template.id} style={{ display: 'flex' }}>
                        <Card
                            className="mind-map-card"
                            cover={(
                                <div
                                    className="image-container"
                                    style={{
                                        backgroundImage: 'url(https://www.shutterstock.com/image-vector/mind-map-template-round-strokes-260nw-2589169071.jpg)',
                                    }}
                                />
                            )}
                            actions={[
                                <div
                                    key="actions"
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '8px',
                                        width: '100%',
                                        padding: '0 8px',
                                    }}
                                >
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <Button
                                            type="primary"
                                            icon={<EditOutlined />}
                                            onClick={() => handleEdit(template.id)}
                                            size="medium"
                                            style={{ flex: 3 }}
                                        >
                                            Edit
                                        </Button>
                                        {!isAssistant && (
                                            <Button
                                                danger
                                                icon={<DeleteOutlined />}
                                                onClick={
                                                    () => handleDelete(template.id, template.name)
                                                }
                                                size="medium"
                                                style={{ flex: 1 }}
                                            />
                                        )}
                                    </div>

                                    {!isAssistant && (
                                        <Button
                                            icon={<TeamOutlined />}
                                            onClick={() => handleManageAssistants(template)}
                                            size="medium"
                                            block
                                        >
                                            Manage Assistants
                                        </Button>
                                    )}
                                </div>,
                            ]}
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

            <EditMindMapTemplate
                open={isEditModalOpen}
                onCancel={handleCloseEditModal}
                initialValues={editingTemplate}
                isEdit
            />

            {managingTemplate && (
                <ManageAssistants
                    open={isManageAssistantsOpen}
                    onClose={handleCloseManageAssistants}
                    template={managingTemplate}
                />
            )}
        </>
    );
};
