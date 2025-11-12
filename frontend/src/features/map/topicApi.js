import baseApi from '../../api/baseApi';

// 临时存储数据（模拟后端存储，之后会替换为真实 API）
let cachedData = {
    articleTopic: '',
    articleContent: '',
};

const articleTopicApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        setArticleTopic: build.mutation({
            // 模拟 POST /api/articleTopic 的 API 调用
            queryFn: async ({ articleTopic, articleContent }) => {
                // 未来这里会是真实的 API 调用：
                // query: ({ articleTopic, articleContent }) => ({
                //     url: 'articleTopic/',
                //     method: 'POST',
                //     body: { articleTopic, articleContent },
                // }),
                cachedData = { articleTopic, articleContent };
                return { data: { success: true, articleTopic, articleContent } };
            },
            invalidatesTags: ['articleTopic'],
        }),
        getArticleTopic: build.query({
            // 模拟 GET /api/articleTopic 的 API 调用
            queryFn: async () =>
            // 未来这里会是真实的 API 调用：
            // query: () => ({ url: 'articleTopic/' }),
                ({ data: cachedData }),
            providesTags: ['articleTopic'],
        }),
    }),
});

export const { useSetArticleTopicMutation, useGetArticleTopicQuery } = articleTopicApi;

export default articleTopicApi;
