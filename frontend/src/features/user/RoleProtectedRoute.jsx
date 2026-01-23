import { useEffect } from 'react';

import { Alert, Spin } from 'antd';
import { Navigate } from 'react-router-dom';

import { useGetMeQuery } from './userApi';

/**
 * Role-based route protection component
 * @param {string[]} allowedRoles - Array of roles that can access this route
 * @param {React.ReactNode} children - Child components to render if authorized
 */
export const RoleProtectedRoute = ({ allowedRoles, children }) => {
    const { data: user, isLoading, error } = useGetMeQuery();

    useEffect(() => {
        if (error) {
            console.error('Failed to get user info:', error);
        }
    }, [error]);

    if (isLoading) {
        return <Spin />;
    }

    if (error) {
        return (
            <Alert
                message="Error"
                description="Failed to load user information. Please refresh the page."
                type="error"
                showIcon
                style={{ margin: '50px' }}
            />
        );
    }

    if (!user || !allowedRoles.includes(user.role)) {
        // Redirect to template list if user doesn't have permission
        return <Navigate to="/mind-map-template-list" replace />;
    }

    return children;
};
