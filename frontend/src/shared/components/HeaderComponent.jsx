import {
    Layout,
    Typography,
} from 'antd';
import { Link } from 'react-router-dom';

const { Header } = Layout;
const { Title } = Typography;

export const HeaderComponent = () => (
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
);
