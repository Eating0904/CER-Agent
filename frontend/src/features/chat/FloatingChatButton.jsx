import { MessageOutlined } from '@ant-design/icons';
import { FloatButton } from 'antd';

export const FloatingChatButton = ({ isChatOpen, onClick }) => {
    if (isChatOpen) {
        return null;
    }

    return (
        <FloatButton
            icon={<MessageOutlined style={{ fontSize: '20px' }} />}
            type="primary"
            style={{
                right: 24,
                bottom: 24,
                width: 60,
                height: 60,
            }}
            onClick={onClick}
            tooltip="Chat with me!"
        />
    );
};
