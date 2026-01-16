import { useEffect, useState } from 'react';

import { SaveOutlined } from '@ant-design/icons';
import {
    Button, Input, message, Space,
} from 'antd';
import { useSearchParams } from 'react-router-dom';

import { useGetEssayQuery, useUpdateEssayMutation } from '../features/essay/essayApi';

const { TextArea } = Input;

export const EssayPageContent = () => {
    const [searchParams] = useSearchParams();
    const mapId = searchParams.get('mapId');

    const [essayContent, setEssayContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // 獲取 Essay
    const { data: essayData, isLoading } = useGetEssayQuery(mapId, {
        skip: !mapId,
    });

    // 更新 Essay
    const [updateEssay] = useUpdateEssayMutation();

    // 載入 Essay 內容
    useEffect(() => {
        if (essayData?.essay?.content) {
            setEssayContent(essayData.essay.content);
        }
    }, [essayData]);

    // 儲存 Essay
    const handleSave = async () => {
        if (!mapId) return;

        setIsSaving(true);
        try {
            await updateEssay({ mapId, content: essayContent }).unwrap();
            message.success('儲存成功');
        }
        catch (error) {
            console.error('儲存失敗:', error);
            message.error('儲存失敗');
        }
        finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
            >
                載入中...
            </div>
        );
    }

    return (
        <div style={{
            height: '100%',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
        }}
        >
            <Space>
                <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={handleSave}
                    loading={isSaving}
                >
                    儲存
                </Button>
            </Space>

            <TextArea
                value={essayContent}
                onChange={(e) => setEssayContent(e.target.value)}
                placeholder="請輸入文章內容..."
                style={{ flex: 1, resize: 'none' }}
                autoSize={false}
            />
        </div>
    );
};
