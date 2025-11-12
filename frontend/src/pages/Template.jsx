import { Layout, Typography } from 'antd';
import { Link } from 'react-router-dom';

const { Header, Content } = Layout;

const { Title } = Typography;

export const Template = ({ children }) => (
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
        <Content
            style={{
                padding: '0 24px 24px 24px',
                height: 'calc(100vh - 50px)',
                backgroundColor: '#fff',
                overflowY: 'auto',
                overflowX: 'hidden',
            }}
        >
            {children}
        </Content>
    </Layout>
);
