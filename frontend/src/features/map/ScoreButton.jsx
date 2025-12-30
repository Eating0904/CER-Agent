import { useState } from 'react';

import { StarFilled } from '@ant-design/icons';
import { Button } from 'antd';

import { BUTTON_COLORS, NEUTRAL_COLORS } from '../../constants/colors';

export const ScoreButton = ({ onSendMessage, setIsChatOpen }) => {
    const [isScoreHovered, setIsScoreHovered] = useState(false);
    const handleScore = async () => {
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
