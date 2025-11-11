import { useCallback, useEffect, useRef } from 'react';

import Cookies from 'js-cookie';

import { isAuthenticated, isTokenExpiring } from '../features/user/authUtils';
import { useRefreshMutation } from '../features/user/userApi';

export const useTokenCheckTimer = (interval = 1000 * 60) => {
    const [refreshToken] = useRefreshMutation();
    const timerRef = useRef(null);

    const checkAndRefreshToken = useCallback(() => {
        const token = Cookies.get('access_token');
        if (!token) return;

        if (!isAuthenticated() || isTokenExpiring(token, 5 * 60 * 1000)) {
            refreshToken();
        }
    }, [refreshToken]);

    useEffect(() => {
        checkAndRefreshToken();

        timerRef.current = setInterval(checkAndRefreshToken, interval);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [interval, checkAndRefreshToken]);
};
