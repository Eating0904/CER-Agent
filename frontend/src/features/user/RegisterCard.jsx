import { useState } from 'react';

import {
    LockOutlined,
    MailOutlined,
    UserOutlined,
} from '@ant-design/icons';
import {
    Alert,
    Button,
    Form,
    Input,
    Typography,
} from 'antd';
import { Link, useNavigate } from 'react-router-dom';

import { CardTemplate } from './CardTemplate';
import { useRegisterMutation } from './userApi';

const { Title, Text } = Typography;

export const RegisterCard = () => {
    const [errorMessage, setErrorMessage] = useState('');

    const navigate = useNavigate();
    const [register, { isLoading }] = useRegisterMutation();

    const handleSubmit = async (values) => {
        setErrorMessage('');

        try {
            const { username, email, password } = values;
            await register({ username, email, password }).unwrap();
            navigate('/login');
        }
        catch (err) {
            if (err.data && err.status === 400) {
                if (err.data.username) {
                    setErrorMessage(err.data.username[0]);
                }
                else if (err.data.email) {
                    setErrorMessage(err.data.email[0]);
                }
                else if (err.data.password) {
                    setErrorMessage(err.data.password[0]);
                }
                else if (err.data.detail) {
                    setErrorMessage(err.data.detail);
                }
                else {
                    setErrorMessage(JSON.stringify(err.data));
                }
            }
            else {
                setErrorMessage('Registration failed. Please check your information or try again later.');
            }
            console.error('Registration error:', err);
        }
    };

    return (
        <CardTemplate>
            <Title
                level={2}
                style={{ textAlign: 'center', marginBottom: 24 }}
            >
                Register Account
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
                name="register"
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
                    name="email"
                    rules={[
                        { required: true, message: 'Please enter your email!' },
                        { type: 'email', message: 'Please enter a valid email!' },
                    ]}
                >
                    <Input
                        prefix={<MailOutlined />}
                        placeholder="Email"
                    />
                </Form.Item>

                <Form.Item
                    name="password"
                    rules={[
                        { required: true, message: 'Please enter your password!' },
                        { min: 6, message: 'Password must be at least 6 characters!' },
                    ]}
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
                        Register
                    </Button>
                </Form.Item>
            </Form>

            <div style={{ textAlign: 'center' }}>
                <Text>
                    Already have an account?<Link to="/login">Login</Link>
                </Text>
            </div>
        </CardTemplate>
    );
};
