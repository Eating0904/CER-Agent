import {
    Layout,
    Typography,
} from 'antd';
import { Link } from 'react-router-dom';

import { NEUTRAL_COLORS } from '../../constants/colors';

const { Header } = Layout;
const { Title } = Typography;

export const HeaderComponent = () => (
    <Header
        style={{
            display: 'flex',
            alignItems: 'center',
            height: '40px',
            flexShrink: 0,
            padding: '0 16px',
            backgroundColor: NEUTRAL_COLORS.white,
        }}
    >
        <Link to="/">
            <Title
                level={4}
                style={{ margin: 0 }}
            >
                CER Agent
            </Title>
        </Link>
    </Header>
);
