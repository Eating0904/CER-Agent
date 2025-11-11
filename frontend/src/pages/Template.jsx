import { Layout, Typography } from 'antd';
import { Link } from 'react-router-dom';

const { Header, Content } = Layout;

const { Title } = Typography;

export const Template = ({ children }) => (
    <Layout>
        <Header
            style={{
                display: 'flex',
                alignItems: 'center',
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
                padding: '0 24px',
                height: 'calc(100vh - 64px - 67px)',
                backgroundColor: '#fff',
            }}
        >
            {children}
        </Content>
    </Layout>
);
