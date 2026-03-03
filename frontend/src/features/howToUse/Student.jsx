import { useRef } from 'react';

import {
    Col,
    Divider,
    Row,
    Typography,
} from 'antd';

import { Account } from './Account';
import { Article } from './Article';
import { Chatbot } from './Chatbot';
import { Essay } from './Essay';
import { MindMap } from './MindMap';
import { Practice } from './Practice';
import { ProactiveFeedback } from './ProactiveFeedback';
import { SectionNav } from './SectionNav';

const { Title } = Typography;

const SECTIONS = [
    { key: 'account', label: 'Account' },
    { key: 'practice', label: 'Practice' },
    { key: 'article', label: 'Article' },
    { key: 'mindmap', label: 'Mind Map' },
    { key: 'essay', label: 'Essay' },
    { key: 'chatbot', label: 'Chatbot' },
    { key: 'proactive', label: 'Proactive Feedback' },
];

// 左側寬度：10.4% ≈ 2.5/24
const NAV_COL_STYLE = { flex: '0 0 10.4%', maxWidth: '10.4%' };
const CONTENT_COL_STYLE = { flex: 1, padding: '32px', textAlign: 'start', height: '100%', overflowY: 'auto' };

export const Student = () => {
    const sectionRefs = useRef({});

    return (
        <Row style={{ height: '100%', background: '#fff', flexWrap: 'nowrap' }}>
            <Col style={NAV_COL_STYLE}>
                <SectionNav sections={SECTIONS} sectionRefs={sectionRefs} />
            </Col>
            <Col style={CONTENT_COL_STYLE}>
                <div
                    ref={(el) => {
                        sectionRefs.current.account = el;
                    }}
                />
                <Title level={3}>Account</Title>
                <Account />
                <Divider size="middle" style={{ borderColor: '#e5d6f8', borderWidth: 2 }} />

                <div
                    ref={(el) => {
                        sectionRefs.current.practice = el;
                    }}
                />
                <Title level={3}>Practice</Title>
                <Practice />
                <Divider size="middle" style={{ borderColor: '#e5d6f8', borderWidth: 2 }} />

                <div
                    ref={(el) => {
                        sectionRefs.current.article = el;
                    }}
                />
                <Title level={3}>Article</Title>
                <Article />
                <Divider size="middle" style={{ borderColor: '#e5d6f8', borderWidth: 2 }} />

                <div
                    ref={(el) => {
                        sectionRefs.current.mindmap = el;
                    }}
                />
                <Title level={3}>Mind Map</Title>
                <MindMap />
                <Divider size="middle" style={{ borderColor: '#e5d6f8', borderWidth: 2 }} />

                <div
                    ref={(el) => {
                        sectionRefs.current.essay = el;
                    }}
                />
                <Title level={3}>Essay</Title>
                <Essay />
                <Divider size="middle" style={{ borderColor: '#e5d6f8', borderWidth: 2 }} />

                <div
                    ref={(el) => {
                        sectionRefs.current.chatbot = el;
                    }}
                />
                <Title level={3}>Chatbot</Title>
                <Chatbot />
                <Divider size="middle" style={{ borderColor: '#e5d6f8', borderWidth: 2 }} />

                <div
                    ref={(el) => {
                        sectionRefs.current.proactive = el;
                    }}
                />
                <Title level={3}>Proactive Feedback</Title>
                <ProactiveFeedback />
            </Col>
        </Row>
    );
};
