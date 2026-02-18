import { useState } from 'react';

import { StarFilled } from '@ant-design/icons';
import { App, Button, Tooltip } from 'antd';
import { useSearchParams } from 'react-router-dom';

import { BUTTON_COLORS, NEUTRAL_COLORS } from '../../constants/colors';
import { useUserActionTracker } from '../userAction/hooks';

export const EssayScoreButton = ({
    onSendMessage,
    setIsChatOpen,
    essayId = null,
    isSending = false,
}) => {
    const { message } = App.useApp();
    const [isScoreHovered, setIsScoreHovered] = useState(false);
    const [searchParams] = useSearchParams();
    const mapId = searchParams.get('mapId');
    const { trackAction } = useUserActionTracker();

    const handleScore = async () => {
        // 如果正在發送訊息，顯示警告並返回
        if (isSending) {
            message.error({
                content: 'Please wait for the current response to finish.',
                key: 'score-sending',
            });
            return;
        }

        // 記錄點擊 Score 按鈕
        trackAction(
            'click_scoring_essay',
            {},
            mapId ? parseInt(mapId, 10) : null,
            essayId ? parseInt(essayId, 10) : null,
        );

        setIsChatOpen(true);
        await onSendMessage('[scoring]');
    };

    const getBackgroundColor = () => {
        if (isSending) return '#f5f5f5';
        if (isScoreHovered) return BUTTON_COLORS.yellowHover;
        return BUTTON_COLORS.yellow;
    };

    return (
        <Tooltip title={isSending ? 'Please wait for the current response to finish' : ''}>
            <div style={{ width: '100%', cursor: isSending ? 'not-allowed' : 'default' }}>
                <Button
                    type="primary"
                    icon={<StarFilled />}
                    onClick={handleScore}
                    disabled={isSending}
                    onMouseEnter={() => setIsScoreHovered(true)}
                    onMouseLeave={() => setIsScoreHovered(false)}
                    style={{
                        width: '100%',
                        color: isSending ? 'rgba(0, 0, 0, 0.25)' : NEUTRAL_COLORS.black,
                        backgroundColor: getBackgroundColor(),
                        transition: 'background-color 0.2s ease',
                        borderColor: isSending ? '#d9d9d9' : BUTTON_COLORS.yellow,
                        boxShadow: isSending ? 'none' : '2px 2px 2px black',
                        cursor: isSending ? 'not-allowed' : 'pointer',
                        pointerEvents: isSending ? 'none' : 'auto',
                    }}
                >
                    Score
                </Button>
            </div>
        </Tooltip>
    );
};
