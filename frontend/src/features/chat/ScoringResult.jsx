import { Card, Space, Typography } from 'antd';

const { Text, Paragraph } = Typography;

export const ScoringResult = ({ data }) => {
    // 解析 JSON 資料
    let scoringData;
    try {
        scoringData = typeof data === 'string' ? JSON.parse(data) : data;
    }
    catch (e) {
        console.error('Failed to parse scoring data:', e);
        return <Text>{typeof data === 'string' ? data : JSON.stringify(data)}</Text>;
    }

    // 驗證資料結構
    if (!scoringData?.Claim || !scoringData?.Evidence || !scoringData?.Reasoning) {
        console.error('Invalid scoring data structure:', scoringData);
        return <Text>{typeof data === 'string' ? data : JSON.stringify(data)}</Text>;
    }

    // 評分項目配置
    const scoringItems = [
        { key: 'Claim', title: 'Claim（主張）', data: scoringData.Claim },
        { key: 'Evidence', title: 'Evidence（證據）', data: scoringData.Evidence },
        { key: 'Reasoning', title: 'Reasoning（推論）', data: scoringData.Reasoning },
    ];

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
                            <Text strong>分數：</Text>
                            <Text style={{ fontSize: '16px', color: '#5B00AE' }}>
                                {item.data.score}
                            </Text>
                        </div>
                        <div>
                            <Text strong>回饋：</Text>
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
