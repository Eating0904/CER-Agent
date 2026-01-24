import baseApi from '../../api/baseApi';

const userActionApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        recordAction: build.mutation({
            query: (body) => ({
                url: 'user-action/',
                method: 'POST',
                body,
            }),
        }),
    }),
});

export const { useRecordActionMutation } = userActionApi;

export default userActionApi;
