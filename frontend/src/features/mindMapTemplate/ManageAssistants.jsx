import { useEffect, useState } from 'react';

import {
    DeleteOutlined,
    PlusOutlined,
    SearchOutlined,
} from '@ant-design/icons';
import {
    Alert,
    App,
    Button,
    List,
    Modal,
    Select,
    Space,
    Spin,
    Tag,
    Typography,
} from 'antd';

import {
    useGetTemplateAssistantsQuery,
    useGrantPermissionMutation,
    useLazySearchAssistantsQuery,
    useRevokePermissionMutation,
} from './mindMapTemplateApi';

const { Text } = Typography;

export const ManageAssistants = ({ open, onClose, template }) => {
    const { message } = App.useApp();
    const [selectedAssistant, setSelectedAssistant] = useState(null);

    const { data: permissions = [], isLoading, error } = useGetTemplateAssistantsQuery(
        template?.id,
        { skip: !template },
    );

    useEffect(() => {
        if (error) {
            console.error('Failed to load task assistants:', error);
        }
    }, [error]);

    const [
        searchAssistants,
        { data: searchResults = [], isFetching: isSearching },
    ] = useLazySearchAssistantsQuery();

    const [grantPermission, { isLoading: isGranting }] = useGrantPermissionMutation();
    const [revokePermission, { isLoading: isRevoking }] = useRevokePermissionMutation();

    const handleSearch = (value) => {
        if (value.length >= 2) {
            searchAssistants(value);
        }
    };

    const handleGrant = async () => {
        if (!selectedAssistant) {
            message.warning('Please select an assistant to grant permission.');
            return;
        }

        try {
            await grantPermission({
                templateId: template.id,
                assistantId: selectedAssistant,
            }).unwrap();

            message.success('Granted successfully！');
            setSelectedAssistant(null);
        }
        catch (err) {
            message.error('Failed to grant permission.');
            console.error('Failed to grant permission:', err);
        }
    };

    const handleRevoke = (assistantId, assistantName) => {
        Modal.confirm({
            title: 'Remove Assistant Permission',
            content: `Are you sure you want to remove "${assistantName}"'s assistant permission?`,
            okText: 'Confirm',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    await revokePermission({
                        templateId: template.id,
                        assistantId,
                    }).unwrap();

                    message.success('Removed successfully！');
                }
                catch (err) {
                    message.error('Failed to remove permission.');
                    console.error('Failed to revoke permission:', err);
                }
            },
        });
    };

    return (
        <Modal
            title={`Manage Assistants for "${template?.name}"`}
            open={open}
            onCancel={onClose}
            footer={null}
            width={600}
        >
            <Space direction="vertical" style={{ width: '100%' }} size="large">
                <div>
                    <Text strong>Add Assistant</Text>
                    <Space.Compact style={{ width: '100%', marginTop: '8px' }}>
                        <Select
                            showSearch
                            placeholder="Search for assistants by username or email"
                            style={{ flex: 1 }}
                            value={selectedAssistant}
                            onChange={setSelectedAssistant}
                            onSearch={handleSearch}
                            filterOption={false}
                            loading={isSearching}
                            notFoundContent={
                                isSearching
                                    ? <Spin size="small" />
                                    : 'No assistants found'
                            }
                            suffixIcon={<SearchOutlined />}
                        >
                            {searchResults.map((assistant) => (
                                <Select.Option key={assistant.id} value={assistant.id}>
                                    {assistant.username} ({assistant.email})
                                </Select.Option>
                            ))}
                        </Select>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleGrant}
                            loading={isGranting}
                        >
                            Add
                        </Button>
                    </Space.Compact>
                </div>

                <div>
                    <Text strong>Authorized Assistants</Text>
                    {isLoading && (
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            <Spin />
                        </div>
                    )}
                    {error && (
                        <Alert
                            message="Error"
                            description="Failed to load assistants."
                            type="error"
                            showIcon
                            style={{ marginTop: '8px' }}
                        />
                    )}
                    {!isLoading && !error && permissions.length === 0 && (
                        <div
                            style={{
                                textAlign: 'center',
                                padding: '20px',
                                color: '#999',
                            }}
                        >
                            No assistants have been authorized yet.
                        </div>
                    )}
                    {!isLoading && !error && permissions.length > 0 && (
                        <List
                            style={{ marginTop: '8px' }}
                            dataSource={permissions}
                            renderItem={(permission) => (
                                <List.Item
                                    actions={[
                                        <Button
                                            key="delete"
                                            type="text"
                                            danger
                                            icon={<DeleteOutlined />}
                                            onClick={() => handleRevoke(
                                                permission.assistant.id,
                                                permission.assistant.username,
                                            )}
                                            loading={isRevoking}
                                        >
                                            Remove
                                        </Button>,
                                    ]}
                                >
                                    <List.Item.Meta
                                        title={permission.assistant.username}
                                        description={permission.assistant.email}
                                    />
                                    <Tag color="green">Assistant</Tag>
                                </List.Item>
                            )}
                        />
                    )}
                </div>
            </Space>
        </Modal>
    );
};
