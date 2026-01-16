import baseApi from '../../api/baseApi';

const chatApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        sendChatMessage: build.mutation({
            query: ({ message, mapId }) => ({
                url: 'chatbot/mindmap/chat/',
                method: 'POST',
                body: {
                    message,
                    map_id: mapId,
                },
            }),
            async onQueryStarted({ message, mapId }, { dispatch, queryFulfilled }) {
                // 1. 立即更新快取，加入使用者訊息
                const patchResult = dispatch(
                    chatApi.util.updateQueryData('getChatHistory', mapId, (draft) => {
                        // 在現有訊息列表中加入新的使用者訊息
                        draft.messages.push({
                            id: draft.messages.length,
                            role: 'user',
                            content: message,
                        });
                    }),
                );

                try {
                    // 2. 等待真實的 API 回應
                    await queryFulfilled;
                    // 3. API 成功後，重新抓取完整資料（包含 AI 回應）
                }
                catch {
                    // 4. 如果失敗，撤銷樂觀更新
                    patchResult.undo();
                }
            },
            invalidatesTags: (result, error, { mapId }) => [{ type: 'ChatHistory', id: mapId }],
        }),
        getChatHistory: build.query({
            query: (mapId) => ({
                url: `chatbot/mindmap/history/${mapId}/`,
            }),
            providesTags: (result, error, mapId) => [{ type: 'ChatHistory', id: mapId }],
        }),
        saveChatMessage: build.mutation({
            query: ({ mapId, role, content }) => ({
                url: `chatbot/mindmap/history/${mapId}/save/`,
                method: 'POST',
                body: {
                    role,
                    content,
                },
            }),
            invalidatesTags: (result, error, { mapId }) => [{ type: 'ChatHistory', id: mapId }],
        }),
    }),
});

export const {
    useSendChatMessageMutation,
    useGetChatHistoryQuery,
    useSaveChatMessageMutation,
} = chatApi;

export default chatApi;
