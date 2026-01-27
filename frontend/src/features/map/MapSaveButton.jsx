import { useState } from 'react';

import { SaveOutlined } from '@ant-design/icons';
import { App, Button } from 'antd';
import { useSearchParams } from 'react-router-dom';

import { BUTTON_COLORS, NEUTRAL_COLORS } from '../../constants/colors';
import { useUserActionTracker } from '../userAction/hooks';

import { useMapContext } from './hooks';
import { useUpdateMapMutation } from './utils';

export const MapSaveButton = () => {
    const { message } = App.useApp();
    const [searchParams] = useSearchParams();
    const mapId = searchParams.get('mapId');
    const { nodes, edges, selectNode, selectEdge } = useMapContext();
    const [updateMap, { isLoading }] = useUpdateMapMutation();
    const [isSaveHovered, setIsSaveHovered] = useState(false);
    const { trackAction } = useUserActionTracker();

    const handleSave = async () => {
        selectNode(null);
        selectEdge(null);
        try {
            await updateMap({
                id: mapId,
                nodes,
                edges,
            }).unwrap();
            message.success('Mind map saved successfully');

            // 記錄手動儲存心智圖
            trackAction('manual_save_map', {
                nodes_count: nodes.length,
                edges_count: edges.length,
            }, mapId ? parseInt(mapId, 10) : null);
        }
        catch (error) {
            message.error('Save failed, please try again later', error);
        }
        finally {
            // pass
        }
    };

    return (
        <Button
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={isLoading}
            onMouseEnter={() => setIsSaveHovered(true)}
            onMouseLeave={() => setIsSaveHovered(false)}
            style={{
                width: '100%',
                color: NEUTRAL_COLORS.black,
                backgroundColor: isSaveHovered
                    ? BUTTON_COLORS.greenHover
                    : BUTTON_COLORS.green,
                transition: 'background-color 0.2s ease',
                borderColor: BUTTON_COLORS.green,
                boxShadow: '2px 2px 2px black',
            }}
        >
            Save
        </Button>
    );
};
