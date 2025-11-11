import { configureStore } from '@reduxjs/toolkit';
import { createLogger } from 'redux-logger';

import baseApi from './api/baseApi';
import { IS_DEV } from './constants';

const apiLoggerWrapper = (apiName, action) => {
    if (action.type.startsWith(apiName)) {
        const actionMeta = action?.meta || {};
        if (Object.keys(actionMeta).length === 0) {
            return action;
        }

        if (actionMeta?.arg?.endpointName === undefined) {
            return action;
        }

        const actionSlice = action.type.split('/');
        const actionType = `${actionSlice[0]}/${actionMeta?.arg?.endpointName}/${actionSlice[2]}`;
        return {
            ...action,
            type: actionType,
        };
    }
    return action;
};

const logger = createLogger({
    duration: true,
    collapsed: true,
    actionTransformer: (action) => {
        let result = { ...action };
        result = apiLoggerWrapper('baseApi', result);
        return result;
    },
});

const store = configureStore({
    reducer: {
        [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefaultMiddleware) => {
        const middlewares = getDefaultMiddleware()
            .concat(
                baseApi.middleware,
            );
        if (IS_DEV) {
            middlewares.push(logger);
        }
        return middlewares;
    },
});

export default store;
