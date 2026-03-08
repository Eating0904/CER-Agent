import { Button, Table, Typography } from 'antd';

const { Text } = Typography;

const ID_STYLE = { fontWeight: 700 };

export const MapViewTable = ({ maps = [], isLoading, onView }) => {
    const columns = [
        {
            title: '#',
            key: 'index',
            width: 60,
            align: 'center',
            render: (_, __, index) => index + 1,
        },
        {
            title: 'Username',
            dataIndex: ['user', 'username'],
            key: 'username',
            width: 150,
            sorter: (a, b) => (a.user?.username ?? '').localeCompare(b.user?.username ?? ''),
        },
        {
            title: 'Practice',
            key: 'practice',
            width: 400,
            sorter: (a, b) => a.id - b.id,
            render: (_, record) => (
                <span>
                    <span style={ID_STYLE}>(ID: {record.id})</span>
                    {record.name ? ` ${record.name}` : ''}
                </span>
            ),
        },
        {
            title: 'Task',
            key: 'task',
            width: 400,
            sorter: (a, b) => (a.template?.id ?? 0) - (b.template?.id ?? 0),
            render: (_, record) => (record.template ? (
                <span>
                    <span style={ID_STYLE}>(ID: {record.template.id})</span>
                    {` ${record.template.name}`}
                </span>
            ) : (
                <Text type="secondary">—</Text>
            )),
        },
        {
            title: '',
            key: 'action',
            width: 80,
            align: 'center',
            fixed: 'right',
            render: (_, record, index) => (
                <Button type="primary" onClick={() => onView(record, index + 1)}>
                    View
                </Button>
            ),
        },
    ];

    return (
        <Table
            dataSource={maps}
            columns={columns}
            rowKey="id"
            loading={isLoading}
            pagination={false}
            scroll={{ y: 'calc(100vh - 240px)' }}
            bordered
            size="middle"
            onRow={() => ({
                style: { cursor: 'default' },
            })}
            rowHoverable
            components={{}}
            style={{
                width: '80%',
            }}
            className="map-view-table"
        />
    );
};
