import { useEffect, useState } from 'react';

import { App, Input, Modal } from 'antd';

import { useUpdateMapMutation } from '../../features/map/utils/mapApi';
import { useUserActionTracker } from '../../features/userAction/hooks';

export const RenameMapModal = ({ open, mapId, currentName, onClose, onSuccess }) => {
    const { message } = App.useApp();
    const [newMapName, setNewMapName] = useState(currentName || '');
    const [updateMap, { isLoading }] = useUpdateMapMutation();
    const { trackAction } = useUserActionTracker();

    useEffect(() => {
        if (open && currentName) {
            setNewMapName(currentName);
        }
    }, [open, currentName]);

    const handleRename = async () => {
        if (!newMapName.trim()) {
            return;
        }

        try {
            await updateMap({
                id: mapId,
                name: newMapName.trim(),
            }).unwrap();

            // 記錄重新命名 map 行為
            await trackAction('rename_map', {
                old_name: currentName,
                new_name: newMapName.trim(),
            }, mapId);

            message.success('Renamed successfully');
            setNewMapName('');
            onSuccess?.();
        }
        catch (err) {
            message.error('Operation failed');
            console.error('Failed to rename:', err);
        }
    };

    const handleCancel = () => {
        setNewMapName('');
        onClose?.();
    };

    return (
        <Modal
            title="Rename"
            open={open}
            centered
            width={400}
            onOk={handleRename}
            onCancel={handleCancel}
            okText="Rename"
            cancelText="Cancel"
            okButtonProps={{ disabled: !newMapName.trim(), loading: isLoading }}
            transitionName=""
        >
            <Input
                value={newMapName}
                onChange={(e) => setNewMapName(e.target.value)}
                onPressEnter={handleRename}
                placeholder="Please enter the name..."
                autoFocus
            />
        </Modal>
    );
};
