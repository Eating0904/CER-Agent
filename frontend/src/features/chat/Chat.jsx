import { useMemo, useState } from 'react';

import { RobotOutlined } from '@ant-design/icons';
import {
    Avatar,
    ChatContainer,
    ConversationHeader,
    MainContainer,
    Message,
    MessageInput,
    MessageList,
    TypingIndicator,
} from '@chatscope/chat-ui-kit-react';

import {
    useGetChatHistoryQuery,
    useSendChatMessageMutation,
} from './chatApi';

import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import './Chat.css';

export const Chat = ({ mapId }) => {
    // 1. 取得資料 (RTK Query)
    const { data: historyData } = useGetChatHistoryQuery(mapId, {
        skip: !mapId,
        refetchOnMountOrArgChange: true,
    });

    const [sendChatMessage] = useSendChatMessageMutation();
    const [isSending, setIsSending] = useState(false);

    // 2. 資料轉換 (Data Transformation)
    // 把後端的格式轉成 UI Kit 看得懂的格式
    // useMemo 確保只有資料變動時才重新計算，優化效能
    const messages = useMemo(() => {
        if (!historyData?.messages) return [];

        return historyData.messages.map((msg) => ({
            id: msg.id, // 保留 id 作為 React key
            message: msg.content,
            direction: msg.role === 'user' ? 'outgoing' : 'incoming',
            sender: msg.role === 'user' ? 'Me' : 'AI',
            position: 'single',
        }));
    }, [historyData]);

    // 3. 處理發送訊息
    const handleSend = async (text) => {
        if (!text.trim()) return;
        try {
            setIsSending(true);
            await sendChatMessage({
                message: text,
                mapId,
            }).unwrap();
        }
        catch (error) {
            console.error('發送失敗:', error);
        }
        finally {
            setIsSending(false);
        }
    };

    return (
        <div style={{ position: 'relative', height: '500px', overflow: 'hidden' }}>
            <MainContainer>
                <ChatContainer>
                    <ConversationHeader>
                        <ConversationHeader.Content userName="Assistant" />
                    </ConversationHeader>

                    <MessageList
                        typingIndicator={
                            isSending
                                ? <TypingIndicator content="Assistant is thinking..." />
                                : null
                        }
                    >
                        {messages.map((msg) => (
                            <Message
                                key={msg.id}
                                model={{
                                    message: msg.message,
                                    sentTime: 'just now',
                                    sender: msg.sender,
                                    direction: msg.direction,
                                    position: 'single',
                                }}
                            >
                                {msg.direction === 'incoming' && (
                                    <Avatar>
                                        <RobotOutlined style={{ fontSize: '14px' }} />
                                    </Avatar>
                                )}
                            </Message>
                        ))}
                    </MessageList>

                    <MessageInput
                        placeholder="Input message..."
                        onSend={handleSend}
                        attachButton={false}
                    />
                </ChatContainer>
            </MainContainer>
        </div>
    );
};
