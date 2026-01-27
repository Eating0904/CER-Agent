import { useEffect, useState } from 'react';

import {
    EditOutlined,
    EllipsisOutlined,
    PlusCircleOutlined,
    SettingOutlined,
} from '@ant-design/icons';
import {
    Alert,
    Button,
    Dropdown,
    List,
    Spin,
} from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { LAYOUT_COLORS, NEUTRAL_COLORS } from '../../constants/colors';
import { useGetMapsQuery } from '../../features/map/utils/mapApi';
import { useGetMeQuery } from '../../features/user/userApi';
import { useUserActionTracker } from '../../features/userAction/hooks';

import { RenameMapModal } from './RenameMapModal';

export const SiderMenu = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const currentMapId = searchParams.get('mapId');
    const [hoveredMapId, setHoveredMapId] = useState(null);
    const [renameModalState, setRenameModalState] = useState({ open: false, map: null });

    const { data: currentUser } = useGetMeQuery();
    const { data: maps = [], isLoading, error } = useGetMapsQuery();
    const { trackAction } = useUserActionTracker();

    useEffect(() => {
        if (error) {
            console.error('Failed to load maps:', error);
        }
    }, [error]);

    if (isLoading) {
        return (
            <div style={{ textAlign: 'center', padding: '20px' }}>
                <Spin />
            </div>
        );
    }

    if (error) {
        return (
            <Alert
                message="Failed to load"
                description="Unable to load map list"
                type="error"
                showIcon
                style={{ margin: '20px' }}
            />
        );
    }

    const getMenuItems = (map) => [
        {
            key: 'rename',
            icon: <EditOutlined />,
            label: 'Rename',
            onClick: () => {
                setRenameModalState({ open: true, map });
            },
        },
    ];

    const canManage = currentUser?.role && ['admin', 'teacher', 'assistant'].includes(currentUser.role);

    const handleAddNewClick = () => {
        trackAction('click_add_new_button');
        navigate('/mind-map-template-list');
    };

    const handleMapClick = (map) => {
        // 記錄切換 map 行為
        trackAction('switch_map', {
            from_map_id: currentMapId ? parseInt(currentMapId, 10) : null,
            to_map_id: map.id,
        }, map.id);

        navigate(`/map?mapId=${map.id}`);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {canManage && (
                <Button
                    onClick={() => navigate('/mind-map-template-management')}
                    style={{
                        height: '40px',
                        padding: '8px 8px 8px 10px',
                        borderRadius: '8px',
                        margin: '4px 8px',
                    }}
                    icon={<SettingOutlined />}
                >
                    Manage
                </Button>
            )}
            <Button
                onClick={handleAddNewClick}
                style={{
                    height: '40px',
                    padding: '8px 8px 8px 10px',
                    borderRadius: '8px',
                    margin: '4px 8px',
                }}
                icon={<PlusCircleOutlined />}
            >
                Add New
            </Button>
            <List
                dataSource={maps}
                renderItem={(map) => {
                    const isSelected = currentMapId === String(map.id);
                    const isHovered = hoveredMapId === map.id;

                    let backgroundColor = NEUTRAL_COLORS.transparent;
                    if (isSelected) {
                        backgroundColor = LAYOUT_COLORS.menuItemSelectedBg;
                    }
                    else if (isHovered) {
                        backgroundColor = LAYOUT_COLORS.menuItemHoverBgTransparent;
                    }

                    return (
                        <List.Item
                            key={map.id}
                            onClick={() => handleMapClick(map)}
                            onMouseEnter={() => setHoveredMapId(map.id)}
                            onMouseLeave={() => setHoveredMapId(null)}
                            style={{
                                cursor: 'pointer',
                                height: '40px',
                                padding: '8px 8px 8px 10px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                borderRadius: '8px',
                                margin: '4px 8px',
                                color: isSelected
                                    ? LAYOUT_COLORS.menuItemSelectedColor
                                    : LAYOUT_COLORS.menuItemColor,
                                backgroundColor,
                                transition: 'background-color 0.2s ease',
                            }}
                        >
                            <div
                                style={{
                                    flex: 1,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {map.name}
                            </div>
                            <Dropdown
                                menu={{ items: getMenuItems(map) }}
                                trigger={['click']}
                                placement="bottomLeft"
                            >
                                <Button
                                    type="text"
                                    icon={<EllipsisOutlined style={{ transform: 'rotate(90deg)', fontSize: '16px' }} />}
                                    shape="circle"
                                    style={{
                                        color: isSelected
                                            ? LAYOUT_COLORS.menuItemSelectedColor
                                            : LAYOUT_COLORS.menuItemColor,
                                        flexShrink: 0,
                                        opacity: isHovered ? 1 : 0,
                                        visibility: isHovered ? 'visible' : 'hidden',
                                    }}
                                />
                            </Dropdown>
                        </List.Item>
                    );
                }}
            />
            <RenameMapModal
                open={renameModalState.open}
                mapId={renameModalState.map?.id}
                currentName={renameModalState.map?.name}
                onClose={() => setRenameModalState({ open: false, map: null })}
                onSuccess={() => setRenameModalState({ open: false, map: null })}
            />
        </div>
    );
};
