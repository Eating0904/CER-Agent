/* eslint-disable max-len */
/* eslint-disable react/no-unescaped-entities */
import {
    Col,
    Image,
    Row,
    Typography,
} from 'antd';

import ChatbotImage from '../../assets/images/how-to-use/chatbot.png';

const { Title, Paragraph } = Typography;

const PARAGRAPH_STYLE = { fontSize: '18px', lineHeight: '2' };

export const Chatbot = () => (
    <>
        <Row>
            <Col span={24}>
                <Paragraph style={PARAGRAPH_STYLE}>
                    <ul>
                        <li>You'll see the chat icon in the bottom-right corner of both the Mind Map and Essay views. Click it to open the AI chat.</li>
                        <li>Note: <span style={{ color: 'red' }}>The chatbot history is isolated by practice and by view.</span></li>
                    </ul>
                </Paragraph>
            </Col>
        </Row>
        <Row gutter={20}>
            <Col span={12}>
                <Title level={4}>In the Mind Map View</Title>
                <Paragraph style={PARAGRAPH_STYLE}>
                    You can ask the AI for:
                    <ul>
                        <li><strong>Canvas Operations</strong>: Navigating and using the mind map tools.</li>
                        <li><strong>Reading Support</strong>: Clarifying English vocabulary and concepts from the article.</li>
                        <li><strong>CER Framework</strong>: Understanding and applying Claim, Evidence, and Reasoning.</li>
                        <li><strong>Content Guidance</strong>: Brainstorming ideas and structuring your map.</li>
                        <li><strong>Scoring & Feedback</strong>: Getting an AI evaluation of your map.</li>
                    </ul>
                </Paragraph>

                <Title level={4}>In the Essay View</Title>
                <Paragraph style={PARAGRAPH_STYLE}>
                    You can ask the AI for:
                    <ul>
                        <li><strong>Language Support</strong>: Overcoming English writing barriers and refining expressions.</li>
                        <li><strong>Content Guidance</strong>: Developing ideas, arguments, and essay structure.</li>
                        <li><strong>Scoring & Feedback</strong>: Getting an AI evaluation of your essay.</li>
                    </ul>
                </Paragraph>
            </Col>
            <Col span={12} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Image src={ChatbotImage} alt="Chatbot" style={{ maxWidth: '100%', height: 'auto' }} />
            </Col>
        </Row>
    </>
);
