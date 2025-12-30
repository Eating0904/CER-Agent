import { useMemo, useState } from 'react';

import { MinusOutlined } from '@ant-design/icons';
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

import robotImage from '../../assets/images/robot.png';

import {
    useGetChatHistoryQuery,
    useSendChatMessageMutation,
} from './chatApi';
import { InitiativeFeedback } from './InitiativeFeedback';

import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import './Chat.css';

export const Chat = ({ isChatOpen, setIsChatOpen, feedbackData, onCloseFeedback, onAutoSave }) => {
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
        }));
    }, [historyData]);

    // 3. 處理發送訊息
    const handleSend = async (text) => {
        if (!text.trim()) return;

        const messageToSend = feedbackData
            ? `[Operate]\n${feedbackData.message}\n[Feedback]\n${feedbackData.description}\n[Question]\n${text}`
            : text;

        // 立即關閉 feedback，不等待發送完成
        if (feedbackData && onCloseFeedback) {
            onCloseFeedback();
        }

        try {
            setIsSending(true);

            // 自動儲存 map
            if (onAutoSave) {
                await onAutoSave();
            }

            await sendChatMessage({
                message: messageToSend,
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

    // 只允許純文字
    const handlePaste = (event) => {
        event.preventDefault();
        const text = event.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
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
                bottom: '12px',
                right: '24px',
                width: '400px',
                height: '65vh',
                zIndex: 1000,
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            }}
        >
            <MainContainer
                style={{
                    borderRadius: '12px',
                    border: '2px solid #5B00AE',
                }}
            >
                <ChatContainer>
                    <ConversationHeader>
                        <ConversationHeader.Content userName="Assistant" />
                        <ConversationHeader.Actions>
                            <Button
                                type="text"
                                icon={<MinusOutlined />}
                                onClick={handleClose}
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
                                }}
                                avatarPosition="tl"
                            >
                                {msg.direction === 'incoming' && (
                                    <Avatar src={robotImage} name="AI" />
                                )}
                            </Message>
                        ))}
                    </MessageList>

                    <MessageInput
                        placeholder="Input message..."
                        onSend={handleSend}
                        onPaste={handlePaste}
                        attachButton={false}
                    />
                </ChatContainer>
            </MainContainer>

            <InitiativeFeedback
                message={feedbackData?.message}
                description={feedbackData?.description}
                onClose={onCloseFeedback}
            />
        </div>
    );
};
