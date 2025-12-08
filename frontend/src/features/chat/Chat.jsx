import { useMemo, useRef } from 'react';

import ChatBot from 'react-chatbotify';

import { useSendChatMessageMutation } from './chatApi';

export const Chat = () => {
    const chatHistoryRef = useRef([]);
    const [sendChatMessage] = useSendChatMessageMutation();

    const flow = useMemo(() => ({
        start: {
            message: '你好！我是你的 AI 助手，有什麼我可以幫忙的嗎？',
            path: 'loop',
        },
        loop: {
            message: async (params) => {
                const userMessage = params.userInput;

                try {
                    const result = await sendChatMessage({
                        message: userMessage,
                        chatHistory: chatHistoryRef.current,
                    }).unwrap();

                    chatHistoryRef.current = [
                        ...chatHistoryRef.current,
                        { role: 'user', content: userMessage },
                        { role: 'model', content: result.message },
                    ];
                    return result.message;
                }
                catch (error) {
                    return `抱歉，發生錯誤：${error.data?.error || error.message || 'Failed to fetch'}`;
                }
            },
            path: 'loop',
        },
    }), [sendChatMessage]);

    const settings = {
        general: {
            embedded: false,
            showHeader: true,
            showFooter: false,
        },
        header: {
            title: 'Assistant',
            showAvatar: true,
            // avatar: undefined,
        },
        chatHistory: {
            storageKey: 'chat_history',
        },
        botBubble: {
            simulateStream: true,
            streamSpeed: 30,
        },
        emoji: {
            disabled: true,
        },
        notification: {
            disabled: true,
        },
        fileAttachment: {
            disabled: true,
        },
        chatButton: {
            icon: undefined,
        },
        tooltip: {
            mode: 'NEVER',
        },
    };

    const styles = {
        chatButtonStyle: {
            width: '40px',
            height: '40px',
        },
    };

    return <ChatBot flow={flow} settings={settings} styles={styles} />;
};
