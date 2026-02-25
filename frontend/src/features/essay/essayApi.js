import baseApi from '../../api/baseApi';

const essayApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getEssay: build.query({
            query: (mapId) => ({
                url: `essay/${mapId}/`,
            }),
            providesTags: (result, error, mapId) => [
                { type: 'Essay', id: mapId },
            ],
        }),

        updateEssay: build.mutation({
            query: ({ mapId, content }) => ({
                url: `essay/${mapId}/`,
                method: 'PUT',
                body: { content },
            }),
            // 不使用 invalidatesTags 避免 refetch getEssay，防止覆蓋使用者本地未儲存的修改
            async onQueryStarted({ mapId }, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    // 用回應資料直接更新 getEssay cache
                    if (data?.success && data?.essay) {
                        dispatch(
                            essayApi.util.updateQueryData('getEssay', mapId, (draft) => {
                                if (draft?.essay) {
                                    Object.assign(draft.essay, data.essay);
                                }
                            }),
                        );
                    }
                }
                catch {
                    // 儲存失敗不需要處理 cache
                }
            },
        }),
    }),
});

export const {
    useGetEssayQuery,
    useUpdateEssayMutation,
} = essayApi;

export default essayApi;
