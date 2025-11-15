import baseApi from '../../api/baseApi';

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
            invalidatesTags: ['Map'],
        }),
        deleteMap: build.mutation({
            query: (id) => ({
                url: `map/${id}/`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Map'],
        }),
    }),
});

export const {
    useGetMapsQuery,
    useGetMapQuery,
    useCreateMapFromTemplateMutation,
    useUpdateMapMutation,
    useDeleteMapMutation,
} = mapApi;

export default mapApi;
