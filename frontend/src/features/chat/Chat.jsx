import { useEffect, useMemo, useState } from 'react';

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
import { App, Button } from 'antd';
import { useSearchParams } from 'react-router-dom';

import robotImage from '../../assets/images/robot.png';

import { useGetChatHistoryQuery, useGetEssayChatHistoryQuery } from './chatApi';
import { InitiativeFeedback } from './InitiativeFeedback';
import { ScoringResult } from './ScoringResult';

import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import './Chat.css';

export const Chat = ({
    isChatOpen,
    setIsChatOpen,
    feedbackData,
    onCloseFeedback,
    onSendMessage,
    isSending,
    chatType = 'mindmap',
    isEssayValid = true,
    isReadOnly = false,
}) => {
    const { message } = App.useApp();
    const [inputValue, setInputValue] = useState('');
    // 從 URL 讀取 mapId
    const [searchParams] = useSearchParams();
    const mapId = searchParams.get('mapId');

    // 根據 chatType 選擇對應的 history query
    const useHistoryQuery = chatType === 'essay'
        ? useGetEssayChatHistoryQuery
        : useGetChatHistoryQuery;

    // 1. 取得資料 (RTK Query)
    const { data: historyData, isLoading, error } = useHistoryQuery(mapId, {
        skip: !mapId,
        refetchOnMountOrArgChange: true,
    });

    useEffect(() => {
        if (error) {
            console.error('Failed to load chat history:', error);
        }
    }, [error]);

    // 2. 資料轉換 (Data Transformation)
    // 把後端的格式轉成 UI Kit 看得懂的格式
    // useMemo 確保只有資料變動時才重新計算，優化效能
    const messages = useMemo(() => {
        if (!historyData?.messages) return [];

        return historyData.messages.map((msg) => ({
            id: msg.id,
            message: msg.content,
            direction: msg.role === 'user' ? 'outgoing' : 'incoming',
            sender: msg.role === 'user' ? 'Me' : 'AI',
            messageType: msg.message_type,
        }));
    }, [historyData]);

    // 3. 處理發送訊息
    const handleSend = async () => {
        // 如果被禁用，顯示警告並不發送
        if (chatType === 'essay' && !isEssayValid) {
            message.error({
                content: 'The essay content should be in English',
                key: 'chat-validation',
            });
            return;
        }

        // 如果 AI 正在思考，顯示警告並不發送
        if (isSending) {
            message.error({
                content: 'Please wait for the current response to finish.',
                key: 'chat-sending',
            });
            return;
        }

        if (!inputValue.trim()) return;

        try {
            const textToSend = inputValue;
            setInputValue(''); // 立即清空輸入框
            await onSendMessage(textToSend);
        }
        catch (err) {
            console.error('Failed to send:', err);
            // 如果發送失敗，將內容放回輸入框
            setInputValue(inputValue);
            throw err;
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
                        {isLoading && (
                            <Message
                                model={{
                                    message: '',
                                    sender: 'System',
                                    direction: 'incoming',
                                }}
                            >
                                <Message.CustomContent>
                                    <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                                        Loading messages...
                                    </div>
                                </Message.CustomContent>
                            </Message>
                        )}
                        {error && (
                            <Message
                                model={{
                                    message: '',
                                    sender: 'System',
                                    direction: 'incoming',
                                }}
                            >
                                <Message.CustomContent>
                                    <div style={{ textAlign: 'center', padding: '20px', color: '#ff4d4f' }}>
                                        Failed to load chat history
                                    </div>
                                </Message.CustomContent>
                            </Message>
                        )}
                        {!isLoading && !error && messages.map((msg) => {
                            const isScoringMessage = msg.messageType === 'cer_scoring' || msg.messageType === 'essay_scoring';

                            return (
                                <Message
                                    key={msg.id}
                                    model={{
                                        message: isScoringMessage ? '' : msg.message,
                                        sentTime: 'just now',
                                        sender: msg.sender,
                                        direction: msg.direction,
                                    }}
                                    avatarPosition="tl"
                                >
                                    {msg.direction === 'incoming' && (
                                        <Avatar src={robotImage} name="AI" />
                                    )}
                                    {isScoringMessage && (
                                        <Message.CustomContent>
                                            <ScoringResult data={msg.message} chatType={chatType} />
                                        </Message.CustomContent>
                                    )}
                                </Message>
                            );
                        })}
                    </MessageList>
                    {!isReadOnly && (
                        <MessageInput
                            placeholder="Input message..."
                            value={inputValue}
                            onChange={setInputValue}
                            onSend={handleSend}
                            onPaste={handlePaste}
                            attachButton={false}
                        />
                    )}
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
