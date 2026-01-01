import baseApi from '../../api/baseApi';

const feedbackApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        createFeedback: build.mutation({
            query: ({ mapId, operations, alertMessage, operationDetails }) => ({
                url: 'feedback/create/',
                method: 'POST',
                body: {
                    map_id: mapId,
                    operations,
                    alert_message: alertMessage,
                    operation_details: operationDetails,
                },
            }),
        }),
    }),
});

export const { useCreateFeedbackMutation } = feedbackApi;

export default feedbackApi;
