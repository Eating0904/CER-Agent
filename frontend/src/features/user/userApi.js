import baseApi from '../../api/baseApi';

import { getRefreshToken, saveAccessToken, saveRefreshToken } from './authUtils';

const userApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        login: build.mutation({
            query: ({ username, password }) => ({
                url: 'user/login/',
                method: 'POST',
                body: { username, password },
            }),
            transformResponse: (response) => {
                const { access, refresh } = response;
                saveAccessToken(access);
                saveRefreshToken(refresh);
                return response;
            },
        }),
        register: build.mutation({
            query: ({ email, username, password }) => ({
                url: 'user/register/',
                method: 'POST',
                body: { email, username, password },
            }),
        }),
        verifyEmail: build.mutation({
            query: ({ email, code }) => ({
                url: 'user/verify-email/',
                method: 'POST',
                body: { email, code },
            }),
        }),
        resendVerification: build.mutation({
            query: ({ email }) => ({
                url: 'user/resend-verification/',
                method: 'POST',
                body: { email },
            }),
        }),
        refresh: build.mutation({
            query: () => ({
                url: 'user/refresh/',
                method: 'POST',
                body: { refresh: getRefreshToken() },
            }),
            transformResponse: (response) => {
                const { access } = response;
                saveAccessToken(access);
                return response;
            },
        }),
        getMe: build.query({
            query: () => ({ url: 'user/me/' }),
            providesTags: ['User'],
        }),
        getVerificationStatus: build.query({
            query: (email) => ({ url: `user/verification-status/?email=${encodeURIComponent(email)}` }),
        }),
    }),
});

export const {
    useLoginMutation,
    useRegisterMutation,
    useVerifyEmailMutation,
    useResendVerificationMutation,
    useRefreshMutation,
    useGetMeQuery,
    useGetVerificationStatusQuery,
} = userApi;

export default userApi;
