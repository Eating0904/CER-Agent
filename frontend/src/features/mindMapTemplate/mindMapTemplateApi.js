import baseApi from '../../api/baseApi';

const mindMapTemplateApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getMindMapTemplates: build.query({
            query: () => ({ url: 'mind-map-template/' }),
            providesTags: ['MindMapTemplate'],
        }),
        getMyMindMapTemplates: build.query({
            query: () => ({ url: 'mind-map-template/my/' }),
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

        // 取得 template 的助教列表
        getTemplateAssistants: build.query({
            query: (templateId) => ({
                url: `mind-map-template/${templateId}/assistants/`,
            }),
            providesTags: ['TemplatePermission'],
        }),

        // 授權助教
        grantPermission: build.mutation({
            query: ({ templateId, assistantId }) => ({
                url: `mind-map-template/${templateId}/grant_permission/`,
                method: 'POST',
                body: { assistant_id: assistantId },
            }),
            invalidatesTags: ['TemplatePermission'],
        }),

        // 移除助教權限
        revokePermission: build.mutation({
            query: ({ templateId, assistantId }) => ({
                url: `mind-map-template/${templateId}/revoke_permission/${assistantId}/`,
                method: 'DELETE',
            }),
            invalidatesTags: ['TemplatePermission'],
        }),

        // 搜尋助教
        searchAssistants: build.query({
            query: (searchTerm) => ({
                url: `user/search/?role=assistant&q=${searchTerm}`,
            }),
        }),
    }),
});

export const {
    useGetMindMapTemplatesQuery,
    useGetMyMindMapTemplatesQuery,
    useGetMindMapTemplateQuery,
    useCreateMindMapTemplateMutation,
    useUpdateMindMapTemplateMutation,
    useDeleteMindMapTemplateMutation,
    useGetTemplateAssistantsQuery,
    useGrantPermissionMutation,
    useRevokePermissionMutation,
    useLazySearchAssistantsQuery,
} = mindMapTemplateApi;

export default mindMapTemplateApi;
