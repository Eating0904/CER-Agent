/* eslint-disable max-len */
/* eslint-disable react/no-unescaped-entities */
import {
    Col,
    Image,
    Row,
    Typography,
} from 'antd';

import Task1Image from '../../assets/images/how-to-use/task-1.png';
import Task2Image from '../../assets/images/how-to-use/task-2.png';

import { StepBadge } from './StepBadge';

const { Title, Paragraph } = Typography;

const PARAGRAPH_STYLE = { fontSize: '18px', lineHeight: '2' };

export const Task = () => (
    <>
        <Row gutter={20}>
            <Col span={12}>
                <Paragraph style={PARAGRAPH_STYLE}>
                    <ul>
                        <li>
                            Click "Manage" on the left side of the page to access this page.
                            (<StepBadge number="1" />)
                        </li>
                        <li>
                            Here are the tasks you created.
                            (<StepBadge number="2" />)
                        </li>
                        <li>
                            Click "+ Add New" to create a new Task.
                            (<StepBadge number="3" />)
                        </li>
                        <li>
                            You can edit, delete, or manage assistants by clicking the corresponding buttons.
                            (<StepBadge number="4" />)
                        </li>
                    </ul>
                </Paragraph>
            </Col>
            <Col span={12} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Image src={Task1Image} alt="Task 1" style={{ maxWidth: '100%', height: 'auto' }} />
            </Col>
        </Row>
        <Row gutter={20} style={{ marginTop: '24px' }}>
            <Col span={12}>
                <Title level={4}>Add / Edit Task</Title>
                <Paragraph style={PARAGRAPH_STYLE}>
                    <ul>
                        <li>
                            Enter the following to add or edit a Task:
                            <ul>
                                <li>
                                    Task Name: For identification.
                                    (<StepBadge number="5" />)
                                </li>
                                <li>
                                    Issue Topic
                                    (<StepBadge number="6" />)
                                </li>
                                <li>
                                    Article Content: Paste the original text here.
                                    (<StepBadge number="7" />)
                                </li>
                                <li>
                                    Task Availability Period: Start and End dates.
                                    (<StepBadge number="8" />)
                                </li>
                            </ul>

                        </li>
                    </ul>
                </Paragraph>
                <Title level={4}>Manage Assistants</Title>
                <Paragraph style={PARAGRAPH_STYLE}>
                    <ul>
                        <li>
                            The authorized assistants for the Task are displayed here.
                            (<StepBadge number="9" />)
                        </li>
                        <li>
                            Enter the assistant's username or email address and click "+ Add" to authorize.
                            (<StepBadge number="10" />)
                        </li>
                        <li>
                            Click "Remove" to revoke the assistant's permissions.
                            (<StepBadge number="11" />)
                        </li>
                        <li>
                            Note:
                            <ul>
                                <li>
                                    <span style={{ color: 'red' }}>Access is managed per task and must be set for each one separately.</span>
                                </li>
                                <li>
                                    <span style={{ color: 'red' }}>Only accounts with the "Assistant" role will be searched.</span>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </Paragraph>
            </Col>
            <Col span={12} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Image src={Task2Image} alt="Task 2" style={{ maxWidth: '100%', height: 'auto' }} />
            </Col>
        </Row>
    </>
);
