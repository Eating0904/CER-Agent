import { useState } from 'react';

import { SaveOutlined } from '@ant-design/icons';
import { App, Button, Tooltip } from 'antd';
import { useSearchParams } from 'react-router-dom';

import { BUTTON_COLORS, NEUTRAL_COLORS } from '../../constants/colors';
import { useUserActionTracker } from '../userAction/hooks';

import { useUpdateEssayMutation } from './essayApi';

export const EssaySaveButton = ({
    essayContent,
    disabled = false,
    onSendMessage,
    setIsChatOpen,
    essayId = null,
    isSending = false,
}) => {
    const { message } = App.useApp();
    const [searchParams] = useSearchParams();
    const mapId = searchParams.get('mapId');
    const [updateEssay, { isLoading }] = useUpdateEssayMutation();
    const [isSaveHovered, setIsSaveHovered] = useState(false);
    const { trackAction } = useUserActionTracker();

    const handleSave = async () => {
        if (disabled) return;
        try {
            // 1. 先儲存 essay
            await updateEssay({
                mapId,
                content: essayContent,
            }).unwrap();
            message.success('Essay saved successfully');

            // 2. 記錄點擊 Save 按鈕（無論是否執行評分都要記錄）
            trackAction(
                'manual_save_essay',
                {},
                mapId ? parseInt(mapId, 10) : null,
                essayId ? parseInt(essayId, 10) : null,
            );

            // 3. 檢查是否有訊息正在處理中
            if (isSending) {
                message.info('Scoring skipped. Please wait for the current response to finish.');
                return;
            }

            // 4. 開啟聊天室
            setIsChatOpen(true);

            // 5. 自動發送 [scoring] 訊息
            await onSendMessage('[scoring]');
        }
        catch (error) {
            message.error('Failed to save');
            console.error('Failed to save essay:', error);
        }
    };

    const getBackgroundColor = () => {
        if (disabled) return '#f5f5f5';
        if (isSaveHovered) return BUTTON_COLORS.greenHover;
        return BUTTON_COLORS.green;
    };

    return (
        <Tooltip title={disabled ? 'The essay content should be in English' : ''}>
            <div style={{ width: '100%', cursor: disabled ? 'not-allowed' : 'default' }}>
                <Button
                    icon={<SaveOutlined />}
                    onClick={handleSave}
                    loading={isLoading}
                    disabled={disabled}
                    onMouseEnter={() => setIsSaveHovered(true)}
                    onMouseLeave={() => setIsSaveHovered(false)}
                    style={{
                        width: '100%',
                        color: disabled ? 'rgba(0, 0, 0, 0.25)' : NEUTRAL_COLORS.black,
                        backgroundColor: getBackgroundColor(),
                        transition: 'background-color 0.2s ease',
                        borderColor: disabled ? '#d9d9d9' : BUTTON_COLORS.green,
                        boxShadow: disabled ? 'none' : '2px 2px 2px black',
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        pointerEvents: disabled ? 'none' : 'auto',
                    }}
                >
                    Save
                </Button>
            </div>
        </Tooltip>
    );
};
