import baseApi from '../../api/baseApi';

const chatApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        sendChatMessage: build.mutation({
            query: ({ message, mapId, userActionId }) => ({
                url: 'chatbot/mindmap/chat/',
                method: 'POST',
                body: {
                    message,
                    map_id: mapId,
                    user_action_id: userActionId,
                },
            }),
            async onQueryStarted({ message, mapId }, { dispatch, queryFulfilled }) {
                // 1. 立即更新快取，加入使用者訊息
                dispatch(
                    chatApi.util.updateQueryData('getChatHistory', mapId, (draft) => {
                        draft.messages.push({
                            id: `temp-user-${Date.now()}`,
                            role: 'user',
                            content: message,
                        });
                    }),
                );

                try {
                    // 2. 等待真實的 API 回應
                    const { data } = await queryFulfilled;
                    // 3. API 成功後，直接將 AI response 更新到 cache（不用 refetch）
                    if (data?.success && data?.message) {
                        dispatch(
                            chatApi.util.updateQueryData('getChatHistory', mapId, (draft) => {
                                draft.messages.push({
                                    id: `ai-${Date.now()}`,
                                    role: 'assistant',
                                    content: data.message,
                                    message_type: data.message_type || null,
                                });
                            }),
                        );
                    }
                }
                catch {
                    // 4. 如果失敗，不需要撤銷（user message 已發送，只是 AI 沒回應）
                }
            },
        }),
        getChatHistory: build.query({
            query: (mapId) => ({
                url: `chatbot/mindmap/history/${mapId}/`,
            }),
            providesTags: (result, error, mapId) => [{ type: 'ChatHistory', id: mapId }],
        }),

        sendEssayChatMessage: build.mutation({
            query: ({ message, mapId, essayPlainText, userActionId }) => ({
                url: 'chatbot/essay/chat/',
                method: 'POST',
                body: {
                    message,
                    map_id: mapId,
                    essay_plain_text: essayPlainText,
                    user_action_id: userActionId,
                },
            }),
            async onQueryStarted({ message, mapId }, { dispatch, queryFulfilled }) {
                // 1. 立即更新快取，加入使用者訊息
                dispatch(
                    chatApi.util.updateQueryData('getEssayChatHistory', mapId, (draft) => {
                        draft.messages.push({
                            id: `temp-user-${Date.now()}`,
                            role: 'user',
                            content: message,
                        });
                    }),
                );

                try {
                    // 2. 等待真實的 API 回應
                    const { data } = await queryFulfilled;
                    // 3. API 成功後，直接將 AI response 更新到 cache（不用 refetch）
                    if (data?.success && data?.message) {
                        dispatch(
                            chatApi.util.updateQueryData('getEssayChatHistory', mapId, (draft) => {
                                draft.messages.push({
                                    id: `ai-${Date.now()}`,
                                    role: 'assistant',
                                    content: data.message,
                                    message_type: data.message_type || null,
                                });
                            }),
                        );
                    }
                }
                catch {
                    // 4. 如果失敗，不需要撤銷（user message 已發送，只是 AI 沒回應）
                }
            },
        }),
        getEssayChatHistory: build.query({
            query: (mapId) => ({
                url: `chatbot/essay/history/${mapId}/`,
            }),
            providesTags: (result, error, mapId) => [{ type: 'EssayChatHistory', id: mapId }],
        }),
    }),
});

export const {
    useSendChatMessageMutation,
    useGetChatHistoryQuery,
    // Essay Chat
    useSendEssayChatMessageMutation,
    useGetEssayChatHistoryQuery,
} = chatApi;

export default chatApi;
