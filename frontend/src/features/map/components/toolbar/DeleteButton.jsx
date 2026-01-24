import { DeleteOutlined } from '@ant-design/icons';
import { App, Button } from 'antd';
import { useSearchParams } from 'react-router-dom';

import { BRAND_COLORS } from '../../../../constants/colors';
import { useUserActionTracker } from '../../../userAction/hooks';
import { useMapContext } from '../../hooks';

export const DeleteButton = () => {
    const { modal } = App.useApp();
    const {
        selectedNodeId,
        selectedEdgeId,
        deleteNode,
        deleteEdge,
        selectedNode,
    } = useMapContext();
    const [searchParams] = useSearchParams();
    const mapId = searchParams.get('mapId');
    const { trackAction } = useUserActionTracker();

    if (!selectedNodeId && !selectedEdgeId) {
        return null;
    }

    const handleDelete = () => {
        const isNode = !!selectedNodeId;

        if (isNode) {
            modal.confirm({
                title: 'Delete Node',
                content: 'Are you sure you want to delete this node? All connected edges will also be deleted.',
                okText: 'Confirm',
                okType: 'primary',
                cancelText: 'Cancel',
                onOk: () => {
                    // 記錄刪除節點行為
                    trackAction('delete_node', {
                        node_id: selectedNodeId,
                        node_type: selectedNode?.data?.type || '',
                    }, mapId ? parseInt(mapId, 10) : null);

                    deleteNode(selectedNodeId);
                },
            });
        }
        else {
            deleteEdge(selectedEdgeId);
        }
    };

    return (
        <div style={{ height: '100%' }}>
            <Button
                color="danger"
                variant="filled"
                icon={<DeleteOutlined />}
                onClick={handleDelete}
                style={{
                    height: '100%',
                    width: '100%',
                    fontSize: '20px',
                    color: BRAND_COLORS.error,
                    border: `1px solid ${BRAND_COLORS.error}`,
                }}
            />
        </div>
    );
};
