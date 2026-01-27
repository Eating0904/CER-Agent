import { useEffect, useState } from 'react';

import { PlusOutlined } from '@ant-design/icons';
import {
    App,
    Button,
    Form,
    Input,
    Modal,
} from 'antd';

import {
    useCreateMindMapTemplateMutation,
    useUpdateMindMapTemplateMutation,
} from './mindMapTemplateApi';

const { TextArea } = Input;

export const EditMindMapTemplate = ({
    open: externalOpen,
    onCancel: externalOnCancel,
    initialValues,
    isEdit = false,
}) => {
    const { message } = App.useApp();
    const [internalOpen, setInternalOpen] = useState(false);
    const [form] = Form.useForm();
    const [createTemplate] = useCreateMindMapTemplateMutation();
    const [updateTemplate] = useUpdateMindMapTemplateMutation();

    const isExternalControl = externalOpen !== undefined && externalOnCancel !== undefined;
    const open = isExternalControl ? externalOpen : internalOpen;

    useEffect(() => {
        if (open && initialValues) {
            form.setFieldsValue(initialValues);
        }
    }, [open, initialValues, form]);

    const showModal = () => {
        setInternalOpen(true);
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            const { name, issueTopic, articleContent } = values;

            const payload = {
                name,
                issue_topic: issueTopic,
                article_content: articleContent,
            };

            if (isEdit && initialValues?.id) {
                await updateTemplate({ id: initialValues.id, ...payload }).unwrap();
                message.success('Task updated successfully!');
            }
            else {
                await createTemplate(payload).unwrap();
                message.success('Task created successfully!');
            }

            form.resetFields();
            if (isExternalControl) {
                externalOnCancel();
            }
            else {
                setInternalOpen(false);
            }
        }
        catch (error) {
            message.error('Failed to save task.');
            console.error('Failed to save task:', error);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        if (isExternalControl) {
            externalOnCancel();
        }
        else {
            setInternalOpen(false);
        }
    };

    return (
        <>
            {!isExternalControl && (
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={showModal}
                    size="medium"
                    style={{ marginBottom: '10px' }}
                >
                    Add New
                </Button>
            )}

            <Modal
                title={isEdit ? 'Edit Task' : 'Add Task'}
                open={open}
                onOk={handleOk}
                onCancel={handleCancel}
                okText="Send"
                cancelText="Cancel"
                width={800}
                centered
            >
                <Form
                    form={form}
                    layout="vertical"
                    size="medium"
                >
                    <Form.Item
                        name="name"
                        label="Task Name"
                        rules={[
                            { required: true, message: 'Please enter the task name!' },
                        ]}
                    >
                        <Input placeholder="Please enter the task name..." />
                    </Form.Item>

                    <Form.Item
                        name="issueTopic"
                        label="Issue Topic"
                        rules={[
                            { required: true, message: 'Please enter the issue topic!' },
                        ]}
                    >
                        <Input placeholder="Please enter the issue topic..." />
                    </Form.Item>

                    <Form.Item
                        name="articleContent"
                        label="Article Content"
                        rules={[
                            { required: true, message: 'Please enter the article content!' },
                        ]}
                    >
                        <TextArea
                            placeholder="Please enter the article content..."
                            rows={10}
                            style={{ resize: 'none' }}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};
