import { useMemo, useState } from 'react';

import { MinusOutlined, RobotOutlined } from '@ant-design/icons';
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
import { Button } from 'antd';
import { useSearchParams } from 'react-router-dom';

import {
    useGetChatHistoryQuery,
    useSendChatMessageMutation,
} from './chatApi';

import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import './Chat.css';

export const Chat = ({ isChatOpen, setIsChatOpen }) => {
    // 從 URL 讀取 mapId
    const [searchParams] = useSearchParams();
    const mapId = searchParams.get('mapId');
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

    // 關閉聊天室
    const handleClose = () => {
        setIsChatOpen(false);
    };

    // 如果聊天室關閉，不顯示任何內容
    if (!isChatOpen) {
        return null;
    }

    return (
        <div
            style={{
                position: 'fixed',
                bottom: '24px',
                right: '24px',
                width: '400px',
                height: '500px',
                zIndex: 1000,
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                border: '1px solid #d9d9d9',
            }}
        >
            <MainContainer>
                <ChatContainer>
                    <ConversationHeader>
                        <ConversationHeader.Content userName="Assistant" />
                        <ConversationHeader.Actions>
                            <Button
                                type="text"
                                icon={<MinusOutlined />}
                                onClick={handleClose}
                                style={{ color: '#666' }}
                            />
                        </ConversationHeader.Actions>
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
