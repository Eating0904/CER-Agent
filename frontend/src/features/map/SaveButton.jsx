import { SaveOutlined } from '@ant-design/icons';
import { Button, message } from 'antd';
import { useSearchParams } from 'react-router-dom';

import { useMapContext } from './hooks';
import { useUpdateMapMutation } from './utils';

export const SaveButton = () => {
    const [searchParams] = useSearchParams();
    const mapId = searchParams.get('mapId');
    const { nodes, edges, selectNode, selectEdge } = useMapContext();
    const [updateMap, { isLoading }] = useUpdateMapMutation();

    const handleSave = async () => {
        selectNode(null);
        selectEdge(null);
        try {
            await updateMap({
                id: mapId,
                nodes,
                edges,
            }).unwrap();
            message.success('map已成功保存');
        }
        catch (error) {
            message.error('保存失敗，請稍後再試', error);
        }
        finally {
            // pass
        }
    };

    return (
        <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={isLoading}
        >
            Save
        </Button>
    );
};
