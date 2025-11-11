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
    }),
});

export const {
    useLoginMutation,
    useRegisterMutation,
    useRefreshMutation,
    useGetMeQuery,
} = userApi;

export default userApi;
