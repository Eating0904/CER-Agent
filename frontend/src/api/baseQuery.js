import { fetchBaseQuery } from '@reduxjs/toolkit/query';
import { Mutex } from 'async-mutex';

import { API_SERVER } from '../constants';
import {
    getAccessToken, getRefreshToken, isAuthenticated, saveAccessToken,
} from '../features/user/authUtils';

const API_URL = `${API_SERVER}/api`;
const mutex = new Mutex();

const baseQuery = fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers) => {
        const token = getAccessToken();
        if (token) {
            headers.set('authorization', `Bearer ${token}`);
        }
        return headers;
    },
});

async function handleRefreshToken(refresh, api) {
    try {
        const refreshResult = await baseQuery(
            { url: '/user/refresh/', method: 'POST', body: { refresh } },
            api,
        );

        if (refreshResult.data) {
            const { access } = refreshResult.data;
            saveAccessToken(access);
            return { success: true };
        }

        return { success: false, error: refreshResult.error };
    }
    catch (error) {
        return { success: false, error };
    }
}

const baseQueryWithReauth = async (args, api, extraOptions) => {
    const url = typeof args === 'string' ? args : args.url;
    const isAuthEndpoint = url.includes('/login')
        || url.includes('/register')
        || url.includes('/refresh');
    if (isAuthEndpoint) {
        return baseQuery(args, api, extraOptions);
    }

    const release = await mutex.acquire();

    try {
        const refresh = getRefreshToken();
        if (!isAuthenticated() && refresh) {
            const result = await handleRefreshToken(refresh, api);
            if (!result.success) {
                return { error: result.error };
            }
        }

        let result = await baseQuery(args, api, extraOptions);

        if (result.error?.status === 401 && refresh) {
            const refreshResult = await handleRefreshToken(refresh, api);

            if (refreshResult.success) {
                result = await baseQuery(args, api, extraOptions);
            }
        }

        return result;
    }
    finally {
        release();
    }
};

export default baseQueryWithReauth;
