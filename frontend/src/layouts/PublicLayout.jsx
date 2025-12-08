import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';

import { LAYOUT_COLORS } from '../constants/colors';

const { Content } = Layout;

export const PublicLayout = () => (
    <Layout style={{ height: '100vh', overflow: 'hidden' }}>
        <Content
            style={{
                padding: '0 24px 24px 24px',
                height: '100vh',
                backgroundColor: LAYOUT_COLORS.contentBg,
                overflowY: 'auto',
                overflowX: 'hidden',
            }}
        >
            <Outlet />
        </Content>
    </Layout>
);
