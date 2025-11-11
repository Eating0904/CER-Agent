import baseApi from '../../api/baseApi';

// 临时存储数据（模拟后端存储，之后会替换为真实 API）
let cachedData = {
    topic: '',
    articleContent: '',
};

const topicApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        setTopic: build.mutation({
        // 模拟 POST /api/topic 的 API 调用
            queryFn: async ({ topic, articleContent }) => {
                // 未来这里会是真实的 API 调用：
                // query: ({ topic, articleContent }) => ({
                //     url: 'topic/',
                //     method: 'POST',
                //     body: { topic, articleContent },
                // }),
                cachedData = { topic, articleContent };
                return { data: { success: true, topic, articleContent } };
            },
            invalidatesTags: ['Topic'],
        }),
        getTopic: build.query({
        // 模拟 GET /api/topic 的 API 调用
            queryFn: async () =>
                // 未来这里会是真实的 API 调用：
                // query: () => ({ url: 'topic/' }),
                ({ data: cachedData }),
            providesTags: ['Topic'],
        }),
    }),
});

export const { useSetTopicMutation, useGetTopicQuery } = topicApi;

export default topicApi;
