import { Card, Space, Typography } from 'antd';

const { Text, Paragraph } = Typography;

export const ScoringResult = ({ data, chatType = 'mindmap' }) => {
    // 解析 JSON 資料
    let scoringData;
    try {
        scoringData = typeof data === 'string' ? JSON.parse(data) : data;
    }
    catch (e) {
        console.error('Failed to parse scoring data:', e);
        return <Text>{typeof data === 'string' ? data : JSON.stringify(data)}</Text>;
    }

    // 根據 chatType 定義評分項目配置
    let scoringItems;

    if (chatType === 'essay') {
        // Essay 評分項目配置
        const essayItems = [
            { key: 'Explanation_of_Issues', title: 'Explanation of Issues' },
            { key: 'Evidence_Integration', title: 'Evidence Integration' },
            { key: 'Influence_of_Context', title: 'Influence of Context' },
            { key: 'Students_Position', title: "Student's Position" },
            { key: 'Conclusions', title: 'Conclusions' },
        ];

        // 驗證 essay 資料結構
        const hasValidEssayData = essayItems.every(
            (item) => scoringData?.[item.key]?.score != null
                    && scoringData?.[item.key]?.feedback,
        );

        if (!hasValidEssayData) {
            console.error('Invalid essay scoring data structure:', scoringData);
            return <Text>{typeof data === 'string' ? data : JSON.stringify(data)}</Text>;
        }

        scoringItems = essayItems.map((item) => ({
            key: item.key,
            title: item.title,
            data: scoringData[item.key],
        }));
    }
    else {
        // Mindmap 評分項目配置
        const mindmapItems = [
            { key: 'Claim', title: 'Claim' },
            { key: 'Evidence', title: 'Evidence' },
            { key: 'Reasoning', title: 'Reasoning' },
        ];

        // 驗證 mindmap 資料結構
        const hasValidMindmapData = mindmapItems.every(
            (item) => scoringData?.[item.key]?.score != null
                    && scoringData?.[item.key]?.feedback,
        );

        if (!hasValidMindmapData) {
            console.error('Invalid mindmap scoring data structure:', scoringData);
            return <Text>{typeof data === 'string' ? data : JSON.stringify(data)}</Text>;
        }

        scoringItems = mindmapItems.map((item) => ({
            key: item.key,
            title: item.title,
            data: scoringData[item.key],
        }));
    }

    return (
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
            {scoringItems.map((item) => (
                <Card
                    key={item.key}
                    title={item.title}
                    size="small"
                    style={{ border: 'none' }}
                    styles={{
                        header: {
                            backgroundColor: '#f5f0ff',
                            fontWeight: 600,
                            borderRadius: '8px',
                        },
                    }}
                >
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        <div>
                            <Text strong>Score: </Text>
                            <Text style={{ fontSize: '16px', color: '#5B00AE', fontWeight: 'bold' }}>
                                {item.data.score}
                            </Text>
                            <Text style={{ fontSize: '12px', color: '#000000', marginLeft: 4 }}>
                                / {chatType === 'mindmap' ? '5' : '4'}
                            </Text>
                        </div>
                        <div>
                            <Text strong>Feedback: </Text>
                            <Paragraph style={{ marginBottom: 0, marginTop: 4 }}>
                                {item.data.feedback}
                            </Paragraph>
                        </div>
                    </Space>
                </Card>
            ))}
        </Space>
    );
};
