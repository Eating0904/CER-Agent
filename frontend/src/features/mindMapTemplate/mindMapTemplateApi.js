import baseApi from '../../api/baseApi';

const mindMapTemplateApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getMindMapTemplates: build.query({
            query: () => ({ url: 'mind-map-template/' }),
            providesTags: ['MindMapTemplate'],
        }),
        getMindMapTemplate: build.query({
            query: (id) => ({ url: `mind-map-template/${id}/` }),
            providesTags: ['MindMapTemplate'],
        }),
        createMindMapTemplate: build.mutation({
            query: (body) => ({
                url: 'mind-map-template/',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['MindMapTemplate'],
        }),
        updateMindMapTemplate: build.mutation({
            query: ({ id, ...body }) => ({
                url: `mind-map-template/${id}/`,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['MindMapTemplate'],
        }),
        deleteMindMapTemplate: build.mutation({
            query: (id) => ({
                url: `mind-map-template/${id}/`,
                method: 'DELETE',
            }),
            invalidatesTags: ['MindMapTemplate'],
        }),
    }),
});

export const {
    useGetMindMapTemplatesQuery,
    useGetMindMapTemplateQuery,
    useCreateMindMapTemplateMutation,
    useUpdateMindMapTemplateMutation,
    useDeleteMindMapTemplateMutation,
} = mindMapTemplateApi;

export default mindMapTemplateApi;
