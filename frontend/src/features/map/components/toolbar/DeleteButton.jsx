import { DeleteOutlined } from '@ant-design/icons';
import { App, Button } from 'antd';

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
        <Button
            danger
            icon={<DeleteOutlined />}
            onClick={handleDelete}
            style={{
                height: '100%',
                width: '100%',
                borderStyle: 'dashed',
            }}
        />
    );
};
