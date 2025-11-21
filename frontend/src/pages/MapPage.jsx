import { Alert, Spin } from 'antd';
import { useSearchParams } from 'react-router-dom';

import { BaseMap } from '../features/map/BaseMap';
import { useGetMapQuery } from '../features/map/mapApi';
import { MapProvider } from '../features/map/MapProvider';
import { ToolBlock } from '../features/map/ToolBlock';
import { useMapNodes } from '../features/map/useMapNodes';

export const MapPage = () => {
    const [searchParams] = useSearchParams();
    const mapId = searchParams.get('mapId');

    const { data: mapData, isLoading, error } = useGetMapQuery(mapId, {
        skip: !mapId,
    });

    const mapContext = useMapNodes(mapData);

    const renderContent = () => {
        if (!mapId) {
            return (
                <Alert
                    message="錯誤"
                    description="未找到地圖 ID"
                    type="error"
                    showIcon
                />
            );
        }

        if (isLoading) {
            return (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <Spin size="large" tip="載入地圖中..." />
                </div>
            );
        }

        if (error) {
            return (
                <Alert
                    message="錯誤"
                    description="載入地圖失敗，請稍後再試"
                    type="error"
                    showIcon
                />
            );
        }

        return (
            <MapProvider value={mapContext}>
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <ToolBlock />
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <BaseMap
                            nodes={mapContext.nodes}
                            edges={mapContext.edges}
                            onNodesChange={mapContext.onNodesChange}
                            onEdgesChange={mapContext.onEdgesChange}
                            onConnect={mapContext.onConnect}
                        />
                    </div>
                </div>
            </MapProvider>
        );
    };

    return <div style={{ height: '100%', width: '100%' }}>{renderContent()}</div>;
};
