/* eslint-disable max-len */
/* eslint-disable react/no-unescaped-entities */
import {
    Col,
    Image,
    Row,
    Typography,
} from 'antd';

import EssayImage from '../../assets/images/how-to-use/essay.png';

import { StepBadge } from './StepBadge';

const { Title, Paragraph } = Typography;

const PARAGRAPH_STYLE = { fontSize: '18px', lineHeight: '2' };

export const Essay = () => (
    <>
        <Row>
            <Col span={24}>
                <Paragraph style={PARAGRAPH_STYLE}>
                    <ul>
                        <li>Click the Switcher (Essay) at the top of the Practice to access this view.</li>
                        <li>Here is the area for you to write your essay.</li>
                        <li>
                            Note: <span style={{ color: 'red' }}>If you directly copy and paste content, a warning will appear and the action will be logged.</span>
                        </li>
                    </ul>
                </Paragraph>
            </Col>
        </Row>

        <Row gutter={20}>
            <Col span={12}>

                <Title level={4}>Divider</Title>
                <Paragraph style={PARAGRAPH_STYLE}>
                    <ul>
                        <li>
                            You can drag the divider to resize the left and right panels.
                            (<StepBadge number="1" />)
                        </li>
                    </ul>
                </Paragraph>

                <Title level={4}>Reference (Mind Map)</Title>
                <Paragraph style={PARAGRAPH_STYLE}>
                    <ul>
                        <li>
                            On the left side is your Mind Map for reference.
                            (<StepBadge number="2" />)
                        </li>
                        <li>Note: <span style={{ color: 'red' }}>You cannot edit the Mind Map from here.</span></li>
                    </ul>
                </Paragraph>

                <Title level={4}>Edit Essay</Title>
                <Paragraph style={PARAGRAPH_STYLE}>
                    <ul>
                        <li>
                            Write your essay here.
                            (<StepBadge number="3" />)
                        </li>
                        <li>
                            Customize styles by using the toolbar.
                            (<StepBadge number="4" />)
                        </li>
                    </ul>
                </Paragraph>

                <Title level={4}>Save</Title>
                <Paragraph style={PARAGRAPH_STYLE}>
                    <ul>
                        <li>
                            Click "Save" to save your Essay.
                            (<StepBadge number="5" />)
                        </li>
                    </ul>
                </Paragraph>

                <Title level={4}>Score</Title>
                <Paragraph style={PARAGRAPH_STYLE}>
                    <ul>
                        <li>
                            Click "Score" and let the AI give you feedback.
                            (<StepBadge number="6" />)
                        </li>
                        <li>Note: <span style={{ color: 'red' }}>Limit of 5 times per Essay.</span></li>
                    </ul>
                </Paragraph>
            </Col>
            <Col span={12} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Image src={EssayImage} alt="Essay" style={{ maxWidth: '100%', height: 'auto' }} />
            </Col>
        </Row>
    </>
);
