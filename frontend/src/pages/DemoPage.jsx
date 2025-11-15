import { Alert, Spin } from 'antd';
import { useSearchParams } from 'react-router-dom';

import { BaseMap } from '../features/map/BaseMap';
import { useGetMapQuery } from '../features/map/mapApi';

import { Template } from './Template';

export const DemoPage = () => {
    const [searchParams] = useSearchParams();
    const mapId = searchParams.get('mapId');

    const { data: mapData, isLoading, error } = useGetMapQuery(mapId, {
        skip: !mapId,
    });

    if (!mapId) {
        return (
            <Template>
                <Alert
                    message="錯誤"
                    description="未找到地圖 ID"
                    type="error"
                    showIcon
                />
            </Template>
        );
    }

    if (isLoading) {
        return (
            <Template>
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <Spin size="large" tip="載入地圖中..." />
                </div>
            </Template>
        );
    }

    if (error) {
        return (
            <Template>
                <Alert
                    message="錯誤"
                    description="載入地圖失敗，請稍後再試"
                    type="error"
                    showIcon
                />
            </Template>
        );
    }

    return (
        <Template>
            <BaseMap mapData={mapData} />
        </Template>
    );
};
