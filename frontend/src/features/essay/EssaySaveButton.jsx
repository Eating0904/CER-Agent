import { useState } from 'react';

import { SaveOutlined } from '@ant-design/icons';
import { App, Button } from 'antd';
import { useSearchParams } from 'react-router-dom';

import { BUTTON_COLORS, NEUTRAL_COLORS } from '../../constants/colors';
import { useUserActionTracker } from '../userAction/hooks';

import { useUpdateEssayMutation } from './essayApi';

export const EssaySaveButton = ({
    essayContent,
    essayId = null,
}) => {
    const { message } = App.useApp();
    const [searchParams] = useSearchParams();
    const mapId = searchParams.get('mapId');
    const [updateEssay, { isLoading }] = useUpdateEssayMutation();
    const [isSaveHovered, setIsSaveHovered] = useState(false);
    const { trackAction } = useUserActionTracker();

    const handleSave = async () => {
        try {
            await updateEssay({
                mapId,
                content: essayContent,
            }).unwrap();
            message.success('Essay saved successfully');

            // 記錄手動儲存 essay
            trackAction(
                'manual_save_essay',
                {},
                mapId ? parseInt(mapId, 10) : null,
                essayId ? parseInt(essayId, 10) : null,
            );
        }
        catch (error) {
            message.error('Failed to save');
            console.error('Failed to save essay:', error);
        }
    };

    const getBackgroundColor = () => {
        if (isSaveHovered) return BUTTON_COLORS.greenHover;
        return BUTTON_COLORS.green;
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
                backgroundColor: getBackgroundColor(),
                transition: 'background-color 0.2s ease',
                borderColor: BUTTON_COLORS.green,
                boxShadow: '2px 2px 2px black',
            }}
        >
            Save
        </Button>
    );
};
