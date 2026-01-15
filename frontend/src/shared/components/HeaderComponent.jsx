import {
    Layout,
    Typography,
} from 'antd';
import { Link } from 'react-router-dom';

import { NEUTRAL_COLORS } from '../../constants/colors';
import { useHeaderContext } from '../HeaderContext';

const { Header } = Layout;
const { Title } = Typography;

export const HeaderComponent = () => {
    const { headerContent } = useHeaderContext();

    return (
        <Header
            style={{
                display: 'flex',
                alignItems: 'center',
                height: '40px',
                flexShrink: 0,
                padding: '4px 0px 0px 8px',
                backgroundColor: NEUTRAL_COLORS.white,
            }}
        >
            {headerContent || (
                <Link to="/">
                    <Title
                        level={4}
                        style={{ margin: 0 }}
                    >
                        CER Agent
                    </Title>
                </Link>
            )}
        </Header>
    );
};
