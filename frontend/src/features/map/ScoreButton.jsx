import { useState } from 'react';

import { StarFilled } from '@ant-design/icons';
import { Button } from 'antd';
import { useSearchParams } from 'react-router-dom';

import { BUTTON_COLORS, NEUTRAL_COLORS } from '../../constants/colors';
import { useUserActionTracker } from '../userAction/hooks';

export const ScoreButton = ({ onSendMessage, setIsChatOpen }) => {
    const [isScoreHovered, setIsScoreHovered] = useState(false);
    const [searchParams] = useSearchParams();
    const mapId = searchParams.get('mapId');
    const { trackAction } = useUserActionTracker();

    const handleScore = async () => {
        // 記錄點擊 Score 按鈕
        trackAction('click_scoring_mindmap', {}, mapId ? parseInt(mapId, 10) : null);

        setIsChatOpen(true);
        await onSendMessage('[scoring]');
    };

    return (
        <Button
            type="primary"
            icon={<StarFilled />}
            onClick={handleScore}
            onMouseEnter={() => setIsScoreHovered(true)}
            onMouseLeave={() => setIsScoreHovered(false)}
            style={{
                width: '100%',
                color: NEUTRAL_COLORS.black,
                backgroundColor: isScoreHovered
                    ? BUTTON_COLORS.yellowHover
                    : BUTTON_COLORS.yellow,
                transition: 'background-color 0.2s ease',
                borderColor: BUTTON_COLORS.yellow,
                boxShadow: '2px 2px 2px black',
            }}
        >
            Score
        </Button>
    );
};
