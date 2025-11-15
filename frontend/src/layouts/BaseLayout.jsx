import { useEffect, useState } from 'react';

import {
    Button,
    Flex,
    Layout,
    Typography,
} from 'antd';
import { PanelLeft } from 'lucide-react';
import { Link, Outlet } from 'react-router-dom';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;
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
            <Header
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    height: '50px',
                    flexShrink: 0,
                }}
            >
                <Link to="/">
                    <Title
                        level={3}
                        style={{
                            color: 'white',
                            margin: 0,
                        }}
                    >
                        CER Agent
                    </Title>
                </Link>
            </Header>
            <Layout style={{ height: 'calc(100vh - 50px)' }}>
                <Sider
                    trigger={null}
                    collapsible
                    collapsed={collapsed}
                    breakpoint="lg"
                    collapsedWidth={0}
                    theme="light"
                    style={{
                        borderRadius: '8px',
                        marginRight: collapsed ? '0px' : '16px',
                    }}
                >
                    <Flex
                        vertical
                        style={{ height: 'calc(100vh - 32px)' }}
                    >
                        <Flex
                            align="center"
                            justify="flex-start"
                            style={{
                                flex: '0 0 48px',
                                paddingLeft: '16px',
                                borderBottom: '1px solid #274554',
                            }}
                        >
                            <Button
                                type="text"
                                icon={<PanelLeft size={20} />}
                                onClick={() => setCollapsed(true)}
                                style={{
                                    fontSize: '16px',
                                    width: 32,
                                    height: 32,
                                }}
                            />
                        </Flex>
                        <MenuComponent
                            style={{
                                flex: 1,
                                overflowY: 'auto',
                            }}
                        />
                    </Flex>
                </Sider>
                <Layout style={{ display: 'flex', flexDirection: 'row' }}>
                    {collapsed && (
                        <Flex
                            align="flex-start"
                            justify="flex-start"
                            style={{
                                width: '40px',
                                height: 'calc(100vh - 32px)',
                                paddingTop: '8px',
                                paddingLeft: '4px',
                                backgroundColor: '#fff',
                                flexShrink: 0,
                                borderRadius: '8px',
                                marginRight: '16px',
                            }}
                        >
                            <Button
                                type="text"
                                icon={<PanelLeft size={20} />}
                                onClick={() => setCollapsed(false)}
                                style={{
                                    fontSize: '16px',
                                    width: 32,
                                    height: 32,
                                }}
                            />
                        </Flex>
                    )}
                    <Content
                        style={{
                            padding: '24px',
                            height: '100%',
                            backgroundColor: '#fff',
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
