import baseApi from '../../../api/baseApi';

const mapApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getMaps: build.query({
            query: () => ({ url: 'map/' }),
            providesTags: ['Map'],
        }),
        getMap: build.query({
            query: (id) => ({ url: `map/${id}/` }),
            providesTags: ['Map'],
        }),
        createMapFromTemplate: build.mutation({
            query: (body) => ({
                url: 'map/create_from_template/',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Map'],
        }),
        updateMap: build.mutation({
            query: ({ id, ...body }) => ({
                url: `map/${id}/`,
                method: 'PATCH',
                body,
            }),
            // 不使用 invalidatesTags 避免 refetch getMap，防止覆蓋使用者本地未儲存的修改
            async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    // 用回應資料直接更新 getMap cache
                    dispatch(
                        mapApi.util.updateQueryData('getMap', id, (draft) => {
                            Object.assign(draft, data);
                        }),
                    );
                }
                catch {
                    // 儲存失敗不需要處理 cache
                }
            },
        }),

    }),
});

export const {
    useGetMapsQuery,
    useGetMapQuery,
    useCreateMapFromTemplateMutation,
    useUpdateMapMutation,
} = mapApi;

export default mapApi;
