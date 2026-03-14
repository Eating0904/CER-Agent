import { useEffect, useState } from 'react';

import { MailOutlined } from '@ant-design/icons';
import {
    Alert,
    Button,
    Input,
    Typography,
} from 'antd';
import { useNavigate } from 'react-router-dom';

import { CardTemplate } from './CardTemplate';
import { useGetVerificationStatusQuery, useResendVerificationMutation, useVerifyEmailMutation } from './userApi';

const { Title, Text } = Typography;

export const VerifyEmailCard = ({ email, onVerified }) => {
    const [code, setCode] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [countdown, setCountdown] = useState(null);

    const navigate = useNavigate();
    const { data: statusData } = useGetVerificationStatusQuery(email);
    const [verifyEmail, { isLoading: isVerifying }] = useVerifyEmailMutation();
    const [resendVerification, { isLoading: isResending }] = useResendVerificationMutation();

    useEffect(() => {
        if (statusData && countdown === null) {
            setCountdown(statusData.cooldownRemaining ?? 0);
        }
    }, [statusData, countdown]);

    useEffect(() => {
        if (countdown !== null && countdown > 0) {
            const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
            return () => clearInterval(timer);
        }
        return undefined;
    }, [countdown]);

    const handleVerify = async () => {
        setErrorMessage('');
        setSuccessMessage('');

        if (code.length !== 6) {
            setErrorMessage('Please enter a 6-digit code.');
            return;
        }

        try {
            await verifyEmail({ email, code }).unwrap();
            setSuccessMessage('Email verified successfully!');

            if (onVerified) {
                setTimeout(() => onVerified(), 1000);
            }
            else {
                setTimeout(() => navigate('/login'), 1500);
            }
        }
        catch (err) {
            if (err?.status >= 500) {
                setErrorMessage('System error occurred. Please try again later.');
            }
            else {
                setErrorMessage(err.data?.error || 'Verification failed. Please try again.');
            }
            console.error('Verify email error:', err);
        }
    };

    const handleResend = async () => {
        setErrorMessage('');
        setSuccessMessage('');

        try {
            await resendVerification({ email }).unwrap();
            setCountdown(60);
            setSuccessMessage('Verification code resent.');
        }
        catch (err) {
            if (err?.status >= 500) {
                setErrorMessage('System error occurred. Please try again later.');
            }
            else if (err.status === 429) {
                const remaining = err.data?.cooldownRemaining ?? 60;
                setCountdown(remaining);
                setErrorMessage('Please wait before requesting a new code.');
            }
            else {
                setErrorMessage(err.data?.error || 'Failed to resend code.');
            }
            console.error('Resend verification code error:', err);
        }
    };

    return (
        <div style={{ height: '100vh' }}>

            <CardTemplate>
                <Title
                    level={2}
                    style={{ textAlign: 'center', marginBottom: 24 }}
                >
                    Email Verification
                </Title>

                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <MailOutlined style={{ fontSize: 32, color: '#1890ff', marginBottom: 8 }} />
                    <div>
                        <Text>Verification code sent to</Text>
                        <br />
                        <Text strong>{email}</Text>
                    </div>
                </div>

                {errorMessage && (
                    <Alert
                        message={errorMessage}
                        type="error"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />
                )}

                {successMessage && (
                    <Alert
                        message={successMessage}
                        type="success"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />
                )}

                <div style={{ marginBottom: 16 }}>
                    <Input.OTP
                        length={6}
                        value={code}
                        onChange={setCode}
                        size="large"
                        style={{ width: '100%' }}
                    />
                </div>

                <Button
                    type="primary"
                    onClick={handleVerify}
                    loading={isVerifying}
                    disabled={code.length !== 6}
                    style={{ width: '100%', marginBottom: 16 }}
                    size="large"
                >
                    Verify
                </Button>

                <div style={{ textAlign: 'center' }}>
                    <Button
                        type="link"
                        onClick={handleResend}
                        loading={isResending}
                        disabled={countdown > 0}
                    >
                        {countdown > 0
                            ? `Resend code (${countdown}s)`
                            : 'Resend code'}
                    </Button>
                </div>
            </CardTemplate>
        </div>
    );
};
