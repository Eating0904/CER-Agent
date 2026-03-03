/* eslint-disable max-len */
/* eslint-disable react/no-unescaped-entities */
import {
    Col,
    Image,
    Row,
    Typography,
} from 'antd';

import Practice1Image from '../../assets/images/how-to-use/practice-1.png';
import Practice2Image from '../../assets/images/how-to-use/practice-2.png';

import { StepBadge } from './StepBadge';

const { Title, Paragraph } = Typography;

const PARAGRAPH_STYLE = { fontSize: '18px', lineHeight: '2' };

export const Practice = () => (
    <>
        <Row gutter={20}>
            <Col span={12}>
                <Title level={4}>Practice Content</Title>
                <Paragraph style={PARAGRAPH_STYLE}>
                    <ul>
                        <li>
                            Your Practices are listed on the left side of the screen. Click one to switch between them.
                            (<StepBadge number="1" />)
                        </li>
                        <li>
                            Each Practice contains an Article, Mind Map, and Essay. You can use the switcher to toggle between different views.
                            (<StepBadge number="2" />)
                        </li>
                        <li>
                            The source Task is displayed at the top of each Practice.
                            (<StepBadge number="3" />)
                        </li>
                    </ul>
                </Paragraph>
            </Col>
            <Col span={12} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Image src={Practice1Image} alt="Practice 1" style={{ maxWidth: '100%', height: 'auto' }} />
            </Col>
        </Row>
        <Row gutter={20} style={{ marginTop: '24px' }}>
            <Col span={12}>
                <Title level={4}>Create Practice</Title>
                <Paragraph style={PARAGRAPH_STYLE}>
                    <ul>
                        <li>
                            Click "+ Add New" on the left side of the page to access this page.
                            (<StepBadge number="4" />)
                        </li>
                        <li>
                            Choose and click the card for the Task you want to complete.
                            (<StepBadge number="5" />)
                        </li>
                        <li>
                            Note:
                            <ul>
                                <li><span style={{ color: 'red' }}>The Task List is created by your teacher. If you don't see what you need, please notify them.</span></li>
                                <li><span style={{ color: 'red' }}>If the Task period has expired or not yet started, you cannot choose it.</span></li>
                            </ul>
                        </li>
                    </ul>
                </Paragraph>

                <Title level={4}>Rename Practice</Title>
                <Paragraph style={PARAGRAPH_STYLE}>
                    <div style={{ marginLeft: '10px' }}>
                        <ul>
                            <li>
                                Hover over the Practice, click More (...), and select "Rename" to change your Practice's name.
                                (<StepBadge number="6" />)
                            </li>
                        </ul>
                    </div>
                </Paragraph>
            </Col>
            <Col span={12} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Image src={Practice2Image} alt="Practice 2" style={{ maxWidth: '100%', height: 'auto' }} />
            </Col>
        </Row>
    </>
);
