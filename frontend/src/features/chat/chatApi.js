import baseApi from '../../api/baseApi';

const chatApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        sendChatMessage: build.mutation({
            query: ({ message, chatHistory }) => ({
                url: 'chatbot/chat/',
                method: 'POST',
                body: {
                    message,
                    chat_history: chatHistory,
                },
            }),
        }),
    }),
});

export const {
    useSendChatMessageMutation,
} = chatApi;

export default chatApi;
