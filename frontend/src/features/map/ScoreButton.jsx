import { useState } from 'react';

import { StarFilled } from '@ant-design/icons';
import { App, Button, Tooltip } from 'antd';
import { useSearchParams } from 'react-router-dom';

import { BUTTON_COLORS, NEUTRAL_COLORS } from '../../constants/colors';
import { useUserActionTracker } from '../userAction/hooks';

export const ScoreButton = ({
    onSendMessage,
    setIsChatOpen,
    isSending = false,
    scoringRemaining = 5,
}) => {
    const { message } = App.useApp();
    const [isScoreHovered, setIsScoreHovered] = useState(false);
    const [searchParams] = useSearchParams();
    const mapId = searchParams.get('mapId');
    const { trackAction } = useUserActionTracker();

    const isDisabled = isSending || scoringRemaining <= 0;

    const handleScore = async () => {
        // 如果正在發送訊息，顯示警告並返回
        if (isSending) {
            message.error({
                content: 'Please wait for the current response to finish.',
                key: 'score-sending',
            });
            return;
        }

        if (scoringRemaining <= 0) {
            message.error({
                content: 'No scoring attempts remaining.',
                key: 'score-limit',
            });
            return;
        }

        // 記錄點擊 Score 按鈕
        trackAction('click_scoring_mindmap', {}, mapId ? parseInt(mapId, 10) : null);

        setIsChatOpen(true);
        await onSendMessage('[scoring]');
    };

    const getBackgroundColor = () => {
        if (isDisabled) return '#f5f5f5';
        if (isScoreHovered) return BUTTON_COLORS.yellowHover;
        return BUTTON_COLORS.yellow;
    };

    const getTooltipTitle = () => {
        if (isSending) return 'Please wait for the current response to finish';
        if (scoringRemaining <= 0) return 'No scoring attempts remaining';
        return '';
    };

    return (
        <Tooltip title={getTooltipTitle()}>
            <div style={{ width: '100%', cursor: isDisabled ? 'not-allowed' : 'default' }}>
                <Button
                    type="primary"
                    icon={<StarFilled />}
                    onClick={handleScore}
                    disabled={isDisabled}
                    onMouseEnter={() => setIsScoreHovered(true)}
                    onMouseLeave={() => setIsScoreHovered(false)}
                    style={{
                        width: '100%',
                        color: isDisabled ? 'rgba(0, 0, 0, 0.25)' : NEUTRAL_COLORS.black,
                        backgroundColor: getBackgroundColor(),
                        transition: 'background-color 0.2s ease',
                        borderColor: isDisabled ? '#d9d9d9' : BUTTON_COLORS.yellow,
                        boxShadow: isDisabled ? 'none' : '2px 2px 2px black',
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                        pointerEvents: isDisabled ? 'none' : 'auto',
                    }}
                >
                    Score ({scoringRemaining})
                </Button>
            </div>
        </Tooltip>
    );
};
