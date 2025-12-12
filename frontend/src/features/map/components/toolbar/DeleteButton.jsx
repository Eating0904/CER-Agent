import { DeleteOutlined } from '@ant-design/icons';
import { App, Button } from 'antd';

import { BRAND_COLORS } from '../../../../constants/colors';
import { useMapContext } from '../../hooks';

export const DeleteButton = () => {
    const { modal } = App.useApp();
    const {
        selectedNodeId,
        selectedEdgeId,
        deleteNode,
        deleteEdge,
    } = useMapContext();

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
