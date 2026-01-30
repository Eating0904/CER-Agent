import { useState } from 'react';

import { LockOutlined, UserOutlined } from '@ant-design/icons';
import {
    Alert,
    Button,
    Form,
    Input,
    Typography,
} from 'antd';
import { Link, useNavigate } from 'react-router-dom';

import { useUserActionTracker } from '../userAction/hooks';

import { CardTemplate } from './CardTemplate';
import { useLoginMutation } from './userApi';

const { Title, Text } = Typography;

export const LoginCard = () => {
    const [errorMessage, setErrorMessage] = useState('');

    const navigate = useNavigate();
    const [login, { isLoading }] = useLoginMutation();
    const { trackAction } = useUserActionTracker();

    const handleSubmit = async (values) => {
        setErrorMessage('');

        try {
            await login(values).unwrap();

            // 記錄登入行為
            await trackAction('login', {});

            navigate('/');
        }
        catch {
            const errorMsg = 'Invalid username or password';
            setErrorMessage(errorMsg);
        }
    };

    return (
        <CardTemplate>
            <Title
                level={2}
                style={{ textAlign: 'center', marginBottom: 24 }}
            >
                Login
            </Title>

            {errorMessage && (
                <Alert
                    message={errorMessage}
                    type="error"
                    showIcon
                    style={{
                        marginBottom: 24,
                    }}
                />
            )}

            <Form
                name="login"
                initialValues={{ remember: true }}
                onFinish={handleSubmit}
                size="large"
            >
                <Form.Item
                    name="username"
                    rules={[{ required: true, message: 'Please enter your username!' }]}
                >
                    <Input
                        prefix={<UserOutlined />}
                        placeholder="Username"
                    />
                </Form.Item>

                <Form.Item
                    name="password"
                    rules={[{ required: true, message: 'Please enter your password!' }]}
                >
                    <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="Password"
                    />
                </Form.Item>

                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={isLoading}
                        style={{ width: '100%' }}
                    >
                        Login
                    </Button>
                </Form.Item>
            </Form>

            <div style={{ textAlign: 'center' }}>
                <Text>
                    No Account？<Link to="/register">Register</Link>
                </Text>
            </div>
        </CardTemplate>
    );
};
