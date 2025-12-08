import { useEffect, useState } from 'react';

import { MenuOutlined } from '@ant-design/icons';
import { Button, Layout } from 'antd';
import { Outlet } from 'react-router-dom';

import { LAYOUT_COLORS } from '../constants/colors';
import { HeaderComponent } from '../shared/components';

const { Sider, Content } = Layout;
const SIDEBAR_STORAGE_KEY = 'sidebar-collapsed';

export const BaseLayout = ({ menuComponent: MenuComponent }) => {
    const [collapsed, setCollapsed] = useState(() => {
        const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
        return saved ? JSON.parse(saved) : false;
    });

    useEffect(() => {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(collapsed));
    }, [collapsed]);

    return (
        <Layout style={{ height: '100vh', overflow: 'hidden' }}>
            <Layout>
                <Sider
                    trigger={null}
                    collapsible
                    collapsed={collapsed}
                    style={{ textAlign: 'start' }}
                    collapsedWidth={55}
                >
                    <Button
                        type="text"
                        icon={<MenuOutlined size={24} />}
                        shape="circle"
                        onClick={() => setCollapsed(!collapsed)}
                        style={{
                            fontSize: '16px',
                            color: LAYOUT_COLORS.siderTriggerColor,
                            margin: '8px 10px',
                        }}
                    />
                    {
                        collapsed
                            ? null
                            : (
                                <MenuComponent
                                    style={{
                                        flex: 1,
                                        overflowY: 'auto',
                                    }}
                                />
                            )
                    }
                </Sider>
                <Layout>
                    <HeaderComponent />
                    <Content
                        style={{
                            padding: '8px',
                            height: 'calc(100vh - 40px)',
                            backgroundColor: LAYOUT_COLORS.contentBg,
                            overflowY: 'auto',
                            overflowX: 'hidden',
                            position: 'relative',
                        }}
                    >
                        <Outlet />
                    </Content>
                </Layout>
            </Layout>
        </Layout>
    );
};
