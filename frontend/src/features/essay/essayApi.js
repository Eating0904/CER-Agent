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
            invalidatesTags: (result, error, { mapId }) => [
                { type: 'Essay', id: mapId },
            ],
        }),
    }),
});

export const {
    useGetEssayQuery,
    useUpdateEssayMutation,
} = essayApi;

export default essayApi;
