import { useState } from 'react';

import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import {
    Alert,
    Button,
    Card,
    Col,
    message,
    Modal,
    Row,
    Spin,
} from 'antd';

import { EditMindMapTemplate } from './EditMindMapTemplate';
import { useDeleteMindMapTemplateMutation, useGetMindMapTemplatesQuery } from './mindMapTemplateApi';

import './MindMapTemplateManagement.css';

const { Meta } = Card;

export const MindMapTemplateManagement = () => {
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const { data: templates = [], isLoading, error } = useGetMindMapTemplatesQuery();
    const [deleteTemplate] = useDeleteMindMapTemplateMutation();

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
            title: 'Delete Mind Map Template',
            content: `Are you sure you want to delete "${templateName}"?`,
            okText: 'Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    await deleteTemplate(templateId).unwrap();
                    message.success('Mind map template deleted successfully!');
                }
                catch {
                    message.error('Failed to delete mind map template. Please try again.');
                }
            },
        });
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditingTemplate(null);
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
                description="Failed to load mind map templates. Please try again later."
                type="error"
                showIcon
            />
        );
    }

    return (
        <>
            <EditMindMapTemplate />
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
                                        gap: '8px',
                                        width: '100%',
                                        padding: '0 8px',
                                    }}
                                >
                                    <Button
                                        type="primary"
                                        icon={<EditOutlined />}
                                        onClick={() => handleEdit(template.id)}
                                        size="medium"
                                        style={{ flex: 3 }}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={() => handleDelete(template.id, template.name)}
                                        size="medium"
                                        style={{ flex: 1 }}
                                    />
                                </div>,
                            ]}
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

            <EditMindMapTemplate
                open={isEditModalOpen}
                onCancel={handleCloseEditModal}
                initialValues={editingTemplate}
                isEdit
            />
        </>
    );
};
