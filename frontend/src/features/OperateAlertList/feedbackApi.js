import baseApi from '../../api/baseApi';

const feedbackApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        createFeedback: build.mutation({
            query: ({ mapId, nodeId, nodeType, text }) => ({
                url: 'feedback/create/',
                method: 'POST',
                body: {
                    map_id: mapId,
                    node_id: nodeId,
                    node_type: nodeType,
                    text,
                },
            }),
        }),
    }),
});

export const { useCreateFeedbackMutation } = feedbackApi;

export default feedbackApi;
