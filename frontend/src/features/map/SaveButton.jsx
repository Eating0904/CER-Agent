import { SaveOutlined } from '@ant-design/icons';
import { Button, message } from 'antd';
import { useSearchParams } from 'react-router-dom';

import { useUpdateMapMutation } from './mapApi';
import { useMapContext } from './useMapContext';

export const SaveButton = () => {
    const [searchParams] = useSearchParams();
    const mapId = searchParams.get('mapId');
    const { nodes, edges } = useMapContext();
    const [updateMap, { isLoading }] = useUpdateMapMutation();

    const handleSave = async () => {
        try {
            await updateMap({
                id: mapId,
                nodes,
                edges,
            }).unwrap();
            message.success('map已成功保存');
        }
        catch (error) {
            message.error('保存失敗，請稍後再試');
            console.error('Failed to save map:', error);
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
