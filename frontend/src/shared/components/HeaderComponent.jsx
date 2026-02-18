import {
    Avatar,
    Button,
    Layout,
    Popover,
    Typography,
} from 'antd';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

import baseApi from '../../api/baseApi';
import { NEUTRAL_COLORS } from '../../constants/colors';
import { logout } from '../../features/user/authUtils';
import { useGetMeQuery } from '../../features/user/userApi';
import { useHeaderContext } from '../HeaderContext';

const { Header } = Layout;
const { Title } = Typography;

export const HeaderComponent = () => {
    const { headerContent } = useHeaderContext();
    const { data: currentUser } = useGetMeQuery();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleLogout = () => {
        logout();
        dispatch(baseApi.util.resetApiState());
        navigate('/login');
    };

    const username = currentUser?.username || '';
    const avatarText = username.slice(0, 2).toUpperCase();

    const popoverContent = (
        <div style={{ minWidth: '160px' }}>
            <div style={{ fontSize: '16px', marginBottom: '8px' }}>
                {username}
            </div>
            <Button
                type="primary"
                block
                onClick={handleLogout}
            >
                Logout
            </Button>
        </div>
    );

    return (
        <Header
            style={{
                display: 'flex',
                alignItems: 'center',
                height: '40px',
                flexShrink: 0,
                padding: '4px 8px 0px 8px',
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
            <Popover
                content={popoverContent}
                trigger="click"
                placement="bottomRight"
            >
                <Avatar
                    style={{
                        backgroundColor: '#7265e6',
                        cursor: 'pointer',
                        flexShrink: 0,
                        marginLeft: 'auto',
                        marginRight: '8px',
                    }}
                >
                    {avatarText}
                </Avatar>
            </Popover>
        </Header>
    );
};
