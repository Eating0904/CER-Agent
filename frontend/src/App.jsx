import {
    Navigate,
    Outlet,
    Route,
    Routes,
} from 'react-router-dom';

import { isAuthenticated } from './features/user/authUtils';
import { useTokenCheckTimer } from './hooks/useTokenCheckTimer';
import { MainLayout, PublicLayout } from './layouts';
import {
    DemoPage,
    LoginPage,
    MindMapTemplateListPage,
    MindMapTemplateManagementPage,
    RegisterPage,
} from './pages';

import '@xyflow/react/dist/style.css';
import './App.css';

const ProtectedRoute = () => {
    const auth = isAuthenticated();

    if (!auth) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

const GuestRoute = () => {
    const auth = isAuthenticated();

    if (auth) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

const App = () => {
    useTokenCheckTimer();

    return (
        <Routes>
            <Route element={<GuestRoute />}>
                <Route element={<PublicLayout />}>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                </Route>
            </Route>

            <Route element={<ProtectedRoute />}>
                <Route element={<MainLayout />}>
                    <Route path="/demo" element={<DemoPage />} />
                    <Route path="/mind-map-template-management" element={<MindMapTemplateManagementPage />} />
                    <Route path="/mind-map-template-list" element={<MindMapTemplateListPage />} />
                </Route>
            </Route>
        </Routes>
    );
};

export default App;
