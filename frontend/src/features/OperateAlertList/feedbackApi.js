import baseApi from '../../api/baseApi';

const feedbackApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        createFeedback: build.mutation({
            query: ({ mapId, text, meta }) => ({
                url: 'feedback/create/',
                method: 'POST',
                body: {
                    map_id: mapId,
                    text,
                    meta,
                },
            }),
        }),
    }),
});

export const { useCreateFeedbackMutation } = feedbackApi;

export default feedbackApi;
