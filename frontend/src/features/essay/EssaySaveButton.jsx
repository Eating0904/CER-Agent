import { useState } from 'react';

import { SaveOutlined } from '@ant-design/icons';
import { App, Button, Tooltip } from 'antd';
import { useSearchParams } from 'react-router-dom';

import { BUTTON_COLORS, NEUTRAL_COLORS } from '../../constants/colors';

import { useUpdateEssayMutation } from './essayApi';

export const EssaySaveButton = ({
    essayContent,
    disabled = false,
}) => {
    const { message } = App.useApp();
    const [searchParams] = useSearchParams();
    const mapId = searchParams.get('mapId');
    const [updateEssay, { isLoading }] = useUpdateEssayMutation();
    const [isSaveHovered, setIsSaveHovered] = useState(false);

    const handleSave = async () => {
        if (disabled) return;
        try {
            await updateEssay({
                mapId,
                content: essayContent,
            }).unwrap();
            message.success('Essay 已成功保存');
        }
        catch (error) {
            message.error('保存失敗，請稍後再試', error);
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
