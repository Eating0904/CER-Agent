import { Button, Space, Typography } from 'antd';
import { useSearchParams } from 'react-router-dom';

import { useUserActionTracker } from '../../../userAction/hooks';

export const ViewSwitcher = ({ taskName }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const currentView = searchParams.get('view') || 'article';
    const mapId = searchParams.get('mapId');
    const { trackAction } = useUserActionTracker();

    const handleViewChange = (view) => {
        // 記錄視圖切換行為
        trackAction('switch_view', {
            from_view: currentView,
            to_view: view,
        }, mapId ? parseInt(mapId, 10) : null);

        const newParams = new URLSearchParams();
        newParams.set('mapId', mapId);
        newParams.set('view', view);
        setSearchParams(newParams);
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <Space.Compact>
                <Button
                    type={currentView === 'article' ? 'primary' : 'default'}
                    onClick={() => handleViewChange('article')}
                >
                    Article
                </Button>
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
            <Typography style={{ color: '#5B00AE', fontSize: '16px', marginLeft: '16px' }}>Task:</Typography>
            <Typography style={{ fontSize: '16px', marginLeft: '4px' }}>{taskName || 'Undefined'}</Typography>
        </div>
    );
};
