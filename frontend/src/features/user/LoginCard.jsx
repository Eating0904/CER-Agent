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
            await trackAction('login');

            navigate('/');
        }
        catch {
            const errorMsg = '帳號或密碼錯誤';
            setErrorMessage(errorMsg);
        }
    };

    return (
        <CardTemplate>
            <Title
                level={2}
                style={{ textAlign: 'center', marginBottom: 24 }}
            >
                登入
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
                    rules={[{ required: true, message: '請輸入帳號!' }]}
                >
                    <Input
                        prefix={<UserOutlined />}
                        placeholder="帳號"
                    />
                </Form.Item>

                <Form.Item
                    name="password"
                    rules={[{ required: true, message: '請輸入密碼' }]}
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
                        登入
                    </Button>
                </Form.Item>
            </Form>

            <div style={{ textAlign: 'center' }}>
                <Text>
                    沒有帳號？<Link to="/register">註冊</Link>
                </Text>
            </div>
        </CardTemplate>
    );
};
