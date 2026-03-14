/* eslint-disable react/no-unescaped-entities */
import {
    Col,
    Image,
    Row,
    Typography,
} from 'antd';

import AccountImage1 from '../../assets/images/how-to-use/account-1.png';
import AccountImage2 from '../../assets/images/how-to-use/account-2.png';

import { StepBadge } from './StepBadge';

const { Title, Paragraph } = Typography;

const PARAGRAPH_STYLE = { fontSize: '18px', lineHeight: '2' };

export const Account = () => (
    <>
        <Row gutter={20}>
            <Col span={12}>
                <Title level={4}>Register</Title>
                <Paragraph style={PARAGRAPH_STYLE}>
                    <ul>
                        <li>
                            <a href="/register">Register Link</a>
                        </li>
                        <li>
                            Enter your Username, Email, and Password to create an account.
                            (<StepBadge number="1" />)
                        </li>
                        <li>
                            After registration,
                            the system will send you a verification code to your email.<br />
                            ( Subject: <strong>[CER-Agent] Verify Your Email</strong> )
                        </li>
                        <li>
                            Enter the verification code to complete the registration.
                            (<StepBadge number="2" />)
                        </li>
                        <li>
                            Note: Password must meet the following requirements:
                            <ul>
                                <li><span style={{ color: 'red' }}>At least 8 characters.</span></li>
                                <li><span style={{ color: 'red' }}>Not entirely numeric.</span></li>
                                <li><span style={{ color: 'red' }}>Avoid common passwords or personal info (username/email).</span></li>
                            </ul>
                        </li>
                        <li>
                            Note: If you have already registered but have not yet verified,
                            you will be required to verify upon your next login.
                        </li>
                    </ul>
                </Paragraph>
            </Col>
            <Col span={12} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Image src={AccountImage1} alt="Account" style={{ maxWidth: '100%', height: 'auto' }} />
            </Col>
        </Row>
        <Row gutter={20}>
            <Col span={12}>
                <Title level={4}>Login</Title>
                <Paragraph style={PARAGRAPH_STYLE}>
                    <ul>
                        <li>
                            <a href="/login">Login Link</a>
                        </li>
                        <li>
                            Enter your Username and Password to log in.
                            (<StepBadge number="3" />)
                        </li>
                    </ul>
                </Paragraph>

                <Title level={4}>Forgot Password</Title>
                <Paragraph style={PARAGRAPH_STYLE}>
                    <ul>
                        <li>
                            Click "Forgot Password?" below the password input box.
                            (<StepBadge number="4" />)
                        </li>
                        <li>
                            Enter your registered email address.
                            The system will send you a verification code.
                            (<StepBadge number="5" />)<br />
                            ( Subject: <strong>[CER-Agent] Password Reset Code</strong> )
                        </li>
                        <li>
                            Enter the verification code and your new password to reset.
                            (<StepBadge number="6" />)
                        </li>
                    </ul>
                </Paragraph>

                <Title level={4}>Logout</Title>
                <Paragraph style={PARAGRAPH_STYLE}>
                    <ul>
                        <li>
                            Click the Avatar in the top-right corner.
                            A Logout button will appear, click it to log out.
                            (<StepBadge number="7" />)
                        </li>
                    </ul>
                </Paragraph>
            </Col>
            <Col span={12} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Image src={AccountImage2} alt="Account" style={{ maxWidth: '100%', height: 'auto' }} />
            </Col>
        </Row>
    </>
);
