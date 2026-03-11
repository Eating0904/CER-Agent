import { useState } from 'react';

import { MailOutlined } from '@ant-design/icons';
import {
    Alert,
    Button,
    Form,
    Input,
    Space,
    Typography,
} from 'antd';

import { CardTemplate } from './CardTemplate';
import { useForgotPasswordMutation } from './userApi';

const { Title, Text } = Typography;

export const ForgotPasswordCard = ({ onCodeSent }) => {
    const [errorMessage, setErrorMessage] = useState('');

    const [forgotPassword, { isLoading: isSending }] = useForgotPasswordMutation();

    const handleSendCode = async (values) => {
        setErrorMessage('');

        try {
            const result = await forgotPassword({ email: values.email }).unwrap();
            onCodeSent(values.email, result.cooldown_remaining ?? 60);
        }
        catch (err) {
            if (err.status === 429) {
                setErrorMessage('Please wait before requesting a new code.');
            }
            else {
                setErrorMessage(err.data?.error || 'Failed to send reset code.');
            }
        }
    };

    return (
        <CardTemplate>
            <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>
                Forgot Password
            </Title>

            {errorMessage && (
                <Alert message={errorMessage} type="error" showIcon style={{ marginBottom: 16 }} />
            )}

            <Space style={{ marginBottom: '18px' }}>
                <Text>Please enter the email you used to register this account.</Text>
            </Space>

            <Form name="forgot-password" onFinish={handleSendCode} size="large">
                <Form.Item
                    name="email"
                    rules={[
                        { required: true, message: 'Please enter your email!' },
                        { type: 'email', message: 'Please enter a valid email!' },
                    ]}
                >
                    <Input prefix={<MailOutlined />} placeholder="Email" />
                </Form.Item>

                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={isSending}
                        style={{ width: '100%' }}
                    >
                        Send Reset Code
                    </Button>
                </Form.Item>
            </Form>
        </CardTemplate>
    );
};
