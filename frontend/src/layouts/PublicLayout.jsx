import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';

import { HeaderComponent } from '../shared/components';

const { Content } = Layout;

export const PublicLayout = () => (
    <Layout style={{ height: '100vh', overflow: 'hidden' }}>
        <HeaderComponent />
        <Content
            style={{
                padding: '0 24px 24px 24px',
                height: 'calc(100vh - 50px)',
                backgroundColor: '#fff',
                overflowY: 'auto',
                overflowX: 'hidden',
            }}
        >
            <Outlet />
        </Content>
    </Layout>
);
