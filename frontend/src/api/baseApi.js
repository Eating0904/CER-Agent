import { createApi } from '@reduxjs/toolkit/query/react';

import baseQueryWithReauth from './baseQuery';

const baseApi = createApi({
    reducerPath: 'baseApi',
    baseQuery: baseQueryWithReauth,
    endpoints: () => ({}),
    tagTypes: [],
});

export default baseApi;
