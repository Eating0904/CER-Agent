import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

export const logout = () => {
    Cookies.remove('access_token', { path: '/' });
    Cookies.remove('refresh_token', { path: '/' });
};

export const saveAccessToken = (token) => {
    Cookies.set('access_token', token, { path: '/' });
};

export const saveRefreshToken = (token) => {
    Cookies.set('refresh_token', token, { path: '/' });
};

export const saveCredentials = ({ access, refresh }) => {
    saveAccessToken(access);
    saveRefreshToken(refresh);
};

export const getAccessToken = () => Cookies.get('access_token');

export const getRefreshToken = () => Cookies.get('refresh_token');

export const isTokenExpiring = (token, deltaSeconds = 0) => {
    if (!token) return true;

    try {
        const decoded = jwtDecode(token);
        return decoded.exp * 1000 - Date.now() < deltaSeconds;
    }
    catch {
        return true;
    }
};

export const isAuthenticated = () => {
    const token = getAccessToken();

    if (!token) return false;

    return !isTokenExpiring(token);
};
