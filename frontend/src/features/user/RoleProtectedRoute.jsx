import { Navigate } from 'react-router-dom';

import { useGetMeQuery } from './userApi';

/**
 * Role-based route protection component
 * @param {string[]} allowedRoles - Array of roles that can access this route
 * @param {React.ReactNode} children - Child components to render if authorized
 */
export const RoleProtectedRoute = ({ allowedRoles, children }) => {
    const { data: user, isLoading } = useGetMeQuery();

    if (isLoading) {
        return null; // or a loading spinner
    }

    if (!user || !allowedRoles.includes(user.role)) {
        // Redirect to template list if user doesn't have permission
        return <Navigate to="/mind-map-template-list" replace />;
    }

    return children;
};
