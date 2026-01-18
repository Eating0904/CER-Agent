import baseApi from '../../api/baseApi';

const feedbackApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        createFeedback: build.mutation({
            query: ({ mapId, metadata, alertTitle, operationDetails }) => ({
                url: 'feedback/create/',
                method: 'POST',
                body: {
                    map_id: mapId,
                    metadata,
                    alert_title: alertTitle,
                    operation_details: operationDetails,
                },
            }),
        }),
    }),
});

export const { useCreateFeedbackMutation } = feedbackApi;

export default feedbackApi;
