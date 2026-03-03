import { useState } from 'react';

import {
    Button,
    Col,
    Row,
    Space,
} from 'antd';

import { Student } from './Student';
import { Teacher } from './Teacher';

export const HowToUse = () => {
    const [view, setView] = useState('student');

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Row style={{ flexShrink: 0, flexWrap: 'nowrap' }}>
                <Col
                    style={{
                        flex: '0 0 10.4%',
                        maxWidth: '10.4%',
                        overflow: 'hidden',
                        backgroundColor: '#faf5ff',
                        borderRight: '1px solid #e9d8fd',
                    }}
                >
                    <Space.Compact style={{ margin: '12px', maxWidth: 'calc(100% - 24px)' }}>
                        <Button
                            size="small"
                            type={view === 'student' ? 'primary' : 'default'}
                            onClick={() => setView('student')}
                        >
                            Student
                        </Button>
                        <Button
                            size="small"
                            type={view === 'teacher' ? 'primary' : 'default'}
                            onClick={() => setView('teacher')}
                        >
                            Teacher
                        </Button>
                    </Space.Compact>
                </Col>
                <Col span={21} />
            </Row>
            <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
                {view === 'student' ? <Student /> : <Teacher />}
            </div>
        </div>
    );
};
