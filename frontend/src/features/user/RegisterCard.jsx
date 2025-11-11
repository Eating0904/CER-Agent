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
                setErrorMessage('註冊失敗，請稍後再試');
            }
        }
    };

    return (
        <CardTemplate>
            <Title
                level={2}
                style={{ textAlign: 'center', marginBottom: 24 }}
            >
                註冊帳號
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
                    rules={[{ required: true, message: '請輸入帳號!' }]}
                >
                    <Input
                        prefix={<UserOutlined />}
                        placeholder="帳號"
                    />
                </Form.Item>

                <Form.Item
                    name="email"
                    rules={[
                        { required: true, message: '請輸入信箱!' },
                        { type: 'email', message: '請輸入有效的信箱!' },
                    ]}
                >
                    <Input
                        prefix={<MailOutlined />}
                        placeholder="信箱"
                    />
                </Form.Item>

                <Form.Item
                    name="password"
                    rules={[
                        { required: true, message: '請輸入密碼!' },
                        { min: 6, message: '密碼至少為6個字符!' },
                    ]}
                >
                    <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="密碼"
                    />
                </Form.Item>

                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={isLoading}
                        style={{ width: '100%' }}
                    >
                        註冊
                    </Button>
                </Form.Item>
            </Form>

            <div style={{ textAlign: 'center' }}>
                <Text>
                    已有帳號？<Link to="/login">登入</Link>
                </Text>
            </div>
        </CardTemplate>
    );
};
