import { CheckCircleTwoTone, CloseCircleTwoTone } from '@ant-design/icons';
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
            title: 'Show',
            dataIndex: 'show',
            key: 'show',
            width: 80,
            align: 'center',
            sorter: (a, b) => {
                if (a.show === b.show) return 0;
                return a.show ? -1 : 1;
            },
            render: (show) => {
                if (show) return <CheckCircleTwoTone twoToneColor="#52c41a" style={{ fontSize: 18 }} />;
                return <CloseCircleTwoTone twoToneColor="#ff4d4f" style={{ fontSize: 18 }} />;
            },
        },
        {
            title: 'Practice',
            key: 'practice',
            width: 300,
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
            width: 300,
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
                width: '85%',
            }}
            className="map-view-table"
        />
    );
};
