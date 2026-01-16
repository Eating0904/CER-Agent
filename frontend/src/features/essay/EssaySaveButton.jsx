import { useState } from 'react';

import { SaveOutlined } from '@ant-design/icons';
import { App, Button } from 'antd';
import { useSearchParams } from 'react-router-dom';

import { BUTTON_COLORS, NEUTRAL_COLORS } from '../../constants/colors';

import { useUpdateEssayMutation } from './essayApi';

export const EssaySaveButton = ({ essayContent }) => {
    const { message } = App.useApp();
    const [searchParams] = useSearchParams();
    const mapId = searchParams.get('mapId');
    const [updateEssay, { isLoading }] = useUpdateEssayMutation();
    const [isSaveHovered, setIsSaveHovered] = useState(false);

    const handleSave = async () => {
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

    return (
        <Button
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={isLoading}
            onMouseEnter={() => setIsSaveHovered(true)}
            onMouseLeave={() => setIsSaveHovered(false)}
            style={{
                width: '100%',
                color: NEUTRAL_COLORS.black,
                backgroundColor: isSaveHovered
                    ? BUTTON_COLORS.greenHover
                    : BUTTON_COLORS.green,
                transition: 'background-color 0.2s ease',
                borderColor: BUTTON_COLORS.green,
                boxShadow: '2px 2px 2px black',
            }}
        >
            Save
        </Button>
    );
};
