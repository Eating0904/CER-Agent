import { Navigate, Route, Routes } from 'react-router-dom';

import { isAuthenticated } from './features/user/authUtils';
import { useTokenCheckTimer } from './hooks/useTokenCheckTimer';
import { Template } from './pages/Template';
import {
    DemoPage,
    LoginPage,
    MindMapTemplatePage,
    RegisterPage,
} from './pages';

import '@xyflow/react/dist/style.css';
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
            <Route
                path="/demo"
                element={(
                    <ProtectedRoute>
                        <DemoPage />
                    </ProtectedRoute>
                )}
            />
            <Route
                path="/mind-map-template"
                element={(
                    <ProtectedRoute>
                        <MindMapTemplatePage />
                    </ProtectedRoute>
                )}
            />
        </Routes>
    );
};

export default App;
