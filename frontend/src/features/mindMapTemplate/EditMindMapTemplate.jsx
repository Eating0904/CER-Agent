import { useEffect, useState } from 'react';

import { PlusOutlined } from '@ant-design/icons';
import {
    App,
    Button,
    DatePicker,
    Form,
    Input,
    Modal,
    Space,
} from 'antd';
import dayjs from 'dayjs';

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
            form.setFieldsValue({
                ...initialValues,
                startDate: initialValues.startDate ? dayjs(initialValues.startDate) : null,
                endDate: initialValues.endDate ? dayjs(initialValues.endDate) : null,
            });
        }
    }, [open, initialValues, form]);

    const showModal = () => {
        setInternalOpen(true);
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            const { name, issueTopic, articleContent, startDate, endDate } = values;

            const payload = {
                name,
                issue_topic: issueTopic,
                article_content: articleContent,
                start_date: startDate ? startDate.toISOString() : null,
                end_date: endDate ? endDate.toISOString() : null,
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
                    <Space size="large">
                        <Form.Item
                            name="startDate"
                            label="Start Date"
                            rules={[
                                { required: true, message: 'Please select the start date!' },
                            ]}
                        >
                            <DatePicker
                                showTime
                                format="YYYY-MM-DD HH:mm:ss"
                                placeholder="Select start date and time"
                                style={{ width: '100%' }}
                            />
                        </Form.Item>

                        <Form.Item
                            name="endDate"
                            label="End Date"
                            rules={[
                                { required: true, message: 'Please select the end date!' },
                            ]}
                        >
                            <DatePicker
                                showTime
                                format="YYYY-MM-DD HH:mm:ss"
                                placeholder="Select end date and time"
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                    </Space>
                </Form>
            </Modal>
        </>
    );
};
