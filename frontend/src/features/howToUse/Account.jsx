import {
    Col,
    Image,
    Row,
    Typography,
} from 'antd';

import AccountImage from '../../assets/images/how-to-use/account.png';

const { Title, Paragraph } = Typography;

const PARAGRAPH_STYLE = { fontSize: '18px', lineHeight: '2' };

export const Account = () => (
    <Row gutter={20}>
        <Col span={12}>
            <Title level={4}>Register</Title>
            <Paragraph style={PARAGRAPH_STYLE}>
                <ul>
                    <li>
                        <a href="/register">Register Link</a>
                    </li>
                    <li>Enter your Username, Email, and Password to create an account.</li>
                    <li>
                        Password must meet the following requirements:
                        <ul>
                            <li><span style={{ color: 'red' }}>At least 8 characters.</span></li>
                            <li><span style={{ color: 'red' }}>Not entirely numeric.</span></li>
                            <li><span style={{ color: 'red' }}>Avoid common passwords or personal info (username/email).</span></li>
                        </ul>
                    </li>
                </ul>
            </Paragraph>

            <Title level={4}>Login</Title>
            <Paragraph style={PARAGRAPH_STYLE}>
                <ul>
                    <li>
                        <a href="/login">Login Link</a>
                    </li>
                    <li>Enter your Username and Password to log in.</li>
                </ul>
            </Paragraph>

            <Title level={4}>Logout</Title>
            <Paragraph style={PARAGRAPH_STYLE}>
                <ul>
                    <li>
                        Click the Avatar in the top-right corner.
                        A Logout button will appear, click it to log out.
                    </li>
                </ul>
            </Paragraph>
        </Col>
        <Col span={12} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Image src={AccountImage} alt="Account" style={{ maxWidth: '100%', height: 'auto' }} />
        </Col>
    </Row>
);
