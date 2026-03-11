import { useEffect, useState } from 'react';

import { MailOutlined } from '@ant-design/icons';
import {
    Alert,
    Button,
    Form,
    Input,
    Typography,
} from 'antd';
import { useNavigate } from 'react-router-dom';

import { CardTemplate } from './CardTemplate';
import { useForgotPasswordMutation, useResetPasswordMutation } from './userApi';

const { Title, Text } = Typography;

export const ResetPasswordCard = ({ email, initialCountdown = 0 }) => {
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [countdown, setCountdown] = useState(initialCountdown);

    const navigate = useNavigate();
    const [forgotPassword, { isLoading: isSending }] = useForgotPasswordMutation();
    const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation();

    useEffect(() => {
        if (countdown !== null && countdown > 0) {
            const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
            return () => clearInterval(timer);
        }
        return undefined;
    }, [countdown]);

    const handleResend = async () => {
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const result = await forgotPassword({ email }).unwrap();
            setCountdown(result.cooldown_remaining ?? 60);
            setSuccessMessage('Reset code resent.');
        }
        catch (err) {
            if (err.status === 429) {
                setCountdown(err.data?.cooldown_remaining ?? 60);
                setErrorMessage('Please wait before requesting a new code.');
            }
            else {
                setErrorMessage(err.data?.error || 'Failed to resend code.');
            }
        }
    };

    const handleReset = async (values) => {
        setErrorMessage('');
        setSuccessMessage('');

        try {
            await resetPassword({
                email,
                code: values.code,
                new_password: values.new_password,
            }).unwrap();

            setSuccessMessage('Password reset successfully! Redirecting to login...');
            setTimeout(() => navigate('/login'), 1500);
        }
        catch (err) {
            if (err.data?.new_password) {
                setErrorMessage(err.data.new_password[0]);
            }
            else {
                setErrorMessage(err.data?.error || 'Failed to reset password.');
            }
        }
    };

    return (
        <CardTemplate>
            <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>
                Reset Password
            </Title>

            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <MailOutlined style={{ fontSize: 32, color: '#1890ff', marginBottom: 8 }} />
                <div>
                    <Text>Reset code sent to</Text>
                    <br />
                    <Text strong>{email}</Text>
                </div>
            </div>

            {errorMessage && (
                <Alert message={errorMessage} type="error" showIcon style={{ marginBottom: 16 }} />
            )}

            {successMessage && (
                <Alert message={successMessage} type="success" showIcon style={{ marginBottom: 16 }} />
            )}

            <Form name="reset-password" onFinish={handleReset} size="large">
                <Form.Item
                    name="code"
                    rules={[
                        { required: true, message: 'Please enter the 6-digit code!' },
                        { len: 6, message: 'Code must be 6 digits!' },
                    ]}
                >
                    <Input.OTP length={6} />
                </Form.Item>

                <Form.Item
                    name="new_password"
                    rules={[
                        { required: true, message: 'Please enter your new password!' },
                        { min: 6, message: 'Password must be at least 6 characters!' },
                    ]}
                >
                    <Input.Password placeholder="New Password" />
                </Form.Item>

                <Form.Item
                    name="confirm_password"
                    dependencies={['new_password']}
                    rules={[
                        { required: true, message: 'Please confirm your password!' },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('new_password') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('Passwords do not match!'));
                            },
                        }),
                    ]}
                >
                    <Input.Password placeholder="Confirm Password" />
                </Form.Item>

                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={isResetting}
                        style={{ width: '100%' }}
                    >
                        Reset Password
                    </Button>
                </Form.Item>
            </Form>

            <div style={{ textAlign: 'center' }}>
                <Button
                    type="link"
                    onClick={handleResend}
                    loading={isSending}
                    disabled={countdown > 0}
                >
                    {countdown > 0
                        ? `Resend code (${countdown}s)`
                        : 'Resend code'}
                </Button>
            </div>
        </CardTemplate>
    );
};
