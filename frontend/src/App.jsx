import { Navigate, Route, Routes } from 'react-router-dom';

import { isAuthenticated } from './features/user/authUtils';
import { useTokenCheckTimer } from './hooks/useTokenCheckTimer';
import { Template } from './pages/Template';
import {
    LoginPage,
    RegisterPage,
} from './pages';

import './App.css';

const ProtectedRoute = ({ children }) => {
    const auth = isAuthenticated();

    if (!auth) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

const GuestRoute = ({ children }) => {
    const auth = isAuthenticated();

    if (auth) {
        return <Navigate to="/" replace />;
    }

    return children;
};

const App = () => {
    useTokenCheckTimer();

    return (
        <Routes>
            <Route
                path="/"
                element={(
                    <ProtectedRoute>
                        <Template />
                    </ProtectedRoute>
                )}
            />
            <Route
                path="/login"
                element={(
                    <GuestRoute>
                        <LoginPage />
                    </GuestRoute>
                )}
            />
            <Route
                path="/register"
                element={(
                    <GuestRoute>
                        <RegisterPage />
                    </GuestRoute>
                )}
            />
        </Routes>
    );
};

export default App;
