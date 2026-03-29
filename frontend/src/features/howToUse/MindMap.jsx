/* eslint-disable max-len */
/* eslint-disable react/no-unescaped-entities */
import {
    Col,
    Image,
    Row,
    Typography,
} from 'antd';

import MindMap1Image from '../../assets/images/how-to-use/mindmap-1.png';
import MindMap2Image from '../../assets/images/how-to-use/mindmap-2.png';

import { StepBadge } from './StepBadge';

const { Title, Paragraph } = Typography;

const PARAGRAPH_STYLE = { fontSize: '18px', lineHeight: '2' };

export const MindMap = () => (
    <>
        <Row>
            <Col span={24}>
                <Paragraph style={PARAGRAPH_STYLE}>
                    <ul>
                        <li>Click the Switcher (Mind Map) at the top of the Practice to access this view.</li>
                        <li>Here is the area for you to build your Mind Map.</li>
                        <li>
                            Note: <span style={{ color: 'red' }}>If you directly copy and paste content, a warning will appear and the action will be logged.</span>
                        </li>
                    </ul>
                </Paragraph>

            </Col>
        </Row>
        <Row gutter={20}>
            <Col span={12}>
                <Title level={4}>Node</Title>
                <Paragraph style={PARAGRAPH_STYLE}>
                    <ul>
                        <li>
                            Select and click a node type to add a new node.
                            (<StepBadge number="1" />)
                        </li>
                        <li>
                            Edit the content.
                            (<StepBadge number="2" />)
                        </li>
                        <li>
                            Edit text styles, including size, color, bold, italic, underline, and alignment.
                            (<StepBadge number="3" />)
                        </li>
                        <li>
                            Edit the node's style, including width, height, background color, and border color.
                            (Click the robot icon to auto-fit the size.)
                            (<StepBadge number="4" />)
                        </li>
                        <li>
                            Select the connection points you want to display.
                            (<StepBadge number="5" />)
                        </li>
                        <li>
                            Drag and drop a node to change its position.
                            Hold down the "Shift" key and drag the mouse to select multiple Nodes or Edges. Then you can move them together.
                            (<StepBadge number="6" />)
                        </li>
                        <li>Note: <span style={{ color: 'red' }}>Remember to select a node before you start editing.</span></li>
                    </ul>
                </Paragraph>
                <Title level={4}>Edge</Title>
                <Paragraph style={PARAGRAPH_STYLE}>
                    <ul>
                        <li>
                            Drag from a connection point to link two nodes together.
                            (<StepBadge number="7" />)
                        </li>
                    </ul>
                </Paragraph>
            </Col>
            <Col span={12} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Image src={MindMap1Image} alt="Mind Map 1" style={{ maxWidth: '100%', height: 'auto' }} />
            </Col>
        </Row>
        <Row gutter={20} style={{ marginTop: '24px' }}>
            <Col span={12}>
                <Title level={4}>Save</Title>
                <Paragraph style={PARAGRAPH_STYLE}>
                    <ul>
                        <li>Click "Save" to save your Mind Map.
                            (<StepBadge number="8" />)
                        </li>
                    </ul>
                </Paragraph>

                <Title level={4}>Delete</Title>
                <Paragraph style={PARAGRAPH_STYLE}>
                    <ul>
                        <li>
                            Click the "Delete Icon" to delete a node or edge.
                            (<StepBadge number="9" />)
                        </li>
                        <li>Note: <span style={{ color: 'red' }}>Remember to select a node or edge before deleting.</span></li>
                    </ul>
                </Paragraph>

                <Title level={4}>Score</Title>
                <Paragraph style={PARAGRAPH_STYLE}>
                    <ul>
                        <li>
                            Click "Score" and let the AI give you feedback.
                            (<StepBadge number="10" />)
                        </li>
                        <li>Note: <span style={{ color: 'red' }}>Limit of 5 times per Mind Map.</span></li>
                    </ul>
                </Paragraph>
            </Col>
            <Col span={12} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Image src={MindMap2Image} alt="Mind Map 2" style={{ maxWidth: '100%', height: 'auto' }} />
            </Col>
        </Row>
    </>
);
