import { useState } from 'react';

import { EllipsisOutlined, PlusCircleOutlined } from '@ant-design/icons';
import {
    Alert,
    Button,
    List,
    Spin,
} from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { LAYOUT_COLORS, NEUTRAL_COLORS } from '../../constants/colors';
import { useGetMapsQuery } from '../../features/map/utils/mapApi';

export const SiderMenu = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const currentMapId = searchParams.get('mapId');
    const [hoveredMapId, setHoveredMapId] = useState(null);

    const { data: maps = [], isLoading, error } = useGetMapsQuery();

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
                message="載入失敗"
                description="無法載入地圖列表"
                type="error"
                showIcon
                style={{ margin: '20px' }}
            />
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Button
                onClick={() => navigate('/mind-map-template-list')}
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
                            onClick={() => navigate(`/map?mapId=${map.id}`)}
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
                            <Button
                                type="text"
                                icon={<EllipsisOutlined style={{ transform: 'rotate(90deg)', fontSize: '16px' }} />}
                                shape="circle"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    // 這裡之後可以加入點擊效果
                                }}
                                style={{
                                    color: isSelected
                                        ? LAYOUT_COLORS.menuItemSelectedColor
                                        : LAYOUT_COLORS.menuItemColor,
                                    flexShrink: 0,
                                    opacity: isHovered ? 1 : 0,
                                    visibility: isHovered ? 'visible' : 'hidden',
                                }}
                            />
                        </List.Item>
                    );
                }}
            />
        </div>
    );
};
