import baseApi from '../../api/baseApi';

const feedbackApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        createFeedback: build.mutation({
            query: ({ mapId, operations, alertMessage }) => ({
                url: 'feedback/create/',
                method: 'POST',
                body: {
                    map_id: mapId,
                    operations,
                    alert_message: alertMessage,
                },
            }),
        }),
    }),
});

export const { useCreateFeedbackMutation } = feedbackApi;

export default feedbackApi;
