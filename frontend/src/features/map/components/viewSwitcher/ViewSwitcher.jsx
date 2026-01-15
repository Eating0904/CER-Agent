import { Button, Space } from 'antd';
import { useSearchParams } from 'react-router-dom';

export const ViewSwitcher = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const currentView = searchParams.get('view') || 'mindmap';
    const mapId = searchParams.get('mapId');

    const handleViewChange = (view) => {
        const newParams = new URLSearchParams();
        newParams.set('mapId', mapId);
        newParams.set('view', view);
        setSearchParams(newParams);
    };

    return (
        <Space.Compact>
            <Button
                type={currentView === 'mindmap' ? 'primary' : 'default'}
                onClick={() => handleViewChange('mindmap')}
            >
                Mind Map
            </Button>
            <Button
                type={currentView === 'essay' ? 'primary' : 'default'}
                onClick={() => handleViewChange('essay')}
            >
                Essay
            </Button>
        </Space.Compact>
    );
};
