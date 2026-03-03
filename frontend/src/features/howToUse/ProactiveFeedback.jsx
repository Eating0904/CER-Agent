/* eslint-disable max-len */
/* eslint-disable react/no-unescaped-entities */
import {
    Col,
    Image,
    Row,
    Typography,
} from 'antd';

import ProactiveFeedbackImage from '../../assets/images/how-to-use/proactive-feedback.png';

import { StepBadge } from './StepBadge';

const { Paragraph } = Typography;

export const ProactiveFeedback = () => (
    <Row gutter={20}>
        <Col span={12}>
            <Paragraph style={{ fontSize: '18px', lineHeight: '2' }}>
                <ul>
                    <li>This may appear on the left side of the Mind Map view, depending on your group assignment.</li>
                    <li>
                        AI will provide Proactive Feedback based on your actions.
                        (<StepBadge number="1" />)
                    </li>
                    <li>
                        Hover over the info mark to see which actions triggered this AI feedback.
                        (<StepBadge number="2" />)
                    </li>
                    <li>
                        Click "Ask" to bring the content into the chat for a deeper discussion with the AI.
                        (<StepBadge number="3" />)
                    </li>
                </ul>
            </Paragraph>
        </Col>
        <Col span={12} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Image src={ProactiveFeedbackImage} alt="Proactive Feedback" style={{ maxWidth: '100%', height: 'auto' }} />
        </Col>
    </Row>
);
