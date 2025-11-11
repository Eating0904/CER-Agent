import { Button, Form, Input } from 'antd';
import { useNavigate } from 'react-router-dom';

import { useSetTopicMutation } from '../map/topicApi';

const { TextArea } = Input;

export const AddMindMapTemplate = () => {
    const [form] = Form.useForm();
    const [setTopic] = useSetTopicMutation();
    const navigate = useNavigate();

    const handleSubmit = async (values) => {
        const { topic, articleContent } = values;
        if (topic?.trim()) {
            await setTopic({ topic, articleContent });
            navigate('/demo');
        }
    };

    return (
        <div
            style={{
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
            }}
        >
            <div style={{ width: '50%' }}>
                <h1>Mind Map Template</h1>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    size="large"
                >
                    <Form.Item
                        name="topic"
                        label="Topic"
                        rules={[
                            { required: true, message: 'Please enter the topic!' },
                        ]}
                    >
                        <Input placeholder="Please enter the topic..." />
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

                    <Form.Item>
                        <Button type="primary" htmlType="submit" size="large" block>
                            Send
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
};
