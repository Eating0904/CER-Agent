import { Alert, List, Spin } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useGetMapsQuery } from '../../features/map/mapApi';

export const SiderMenu = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const currentMapId = searchParams.get('mapId');

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
        <List
            dataSource={maps}
            renderItem={(map) => (
                <List.Item
                    key={map.id}
                    onClick={() => navigate(`/demo?mapId=${map.id}`)}
                    style={{
                        cursor: 'pointer',
                        backgroundColor: currentMapId === String(map.id) ? '#e6f7ff' : 'transparent',
                        padding: '12px 16px',
                    }}
                    className="map-list-item"
                >
                    <List.Item.Meta
                        title={map.name}
                        description={new Date(map.created_at).toLocaleDateString()}
                    />
                </List.Item>
            )}
        />
    );
};
