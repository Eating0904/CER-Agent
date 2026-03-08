import {
    Button,
    Col,
    Form,
    Input,
    Row,
    Select,
    Space,
} from 'antd';

import { useGetMindMapTemplatesQuery } from '../mindMapTemplate/mindMapTemplateApi';

export const MapViewFilter = ({ form, onSearch, onReset }) => {
    const { data: templates = [] } = useGetMindMapTemplatesQuery();

    const templateOptions = templates.map((t) => ({
        label: `(ID: ${t.id}) ${t.name}`,
        value: t.id,
    }));

    return (
        <Form form={form} layout="vertical" style={{ marginBottom: 24 }}>
            <Row gutter={16} align="center" width="100%">
                <Col span={1} />
                <Col span={4}>
                    <Form.Item label="Username" name="username" style={{ marginBottom: 0 }}>
                        <Input
                            placeholder="input username"
                            onPressEnter={onSearch}
                            allowClear
                        />
                    </Form.Item>
                </Col>
                <Col span={3}>
                    <Form.Item label="Practice ID" name="map_id" style={{ marginBottom: 0 }}>
                        <Input
                            placeholder="input practice ID"
                            onPressEnter={onSearch}
                            allowClear
                        />
                    </Form.Item>
                </Col>
                <Col span={4}>
                    <Form.Item label="Practice Name" name="map_name" style={{ marginBottom: 0 }}>
                        <Input
                            placeholder="input practice name"
                            onPressEnter={onSearch}
                            allowClear
                        />
                    </Form.Item>
                </Col>
                <Col span={7}>
                    <Form.Item label="Task" name="template_id" style={{ marginBottom: 0 }}>
                        <Select
                            placeholder="input or select task"
                            allowClear
                            options={templateOptions}
                            showSearch
                            filterOption={
                                (input, option) => option.label
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                            }
                            style={{ width: '100%', textAlign: 'left' }}
                        />
                    </Form.Item>
                </Col>
                <Col span={3} style={{ alignSelf: 'flex-end', textAlign: 'right' }}>
                    <Form.Item style={{ marginBottom: 0 }}>
                        <Space>
                            <Button type="primary" onClick={onSearch}>
                                Search
                            </Button>
                            <Button onClick={onReset}>
                                Reset
                            </Button>
                        </Space>
                    </Form.Item>
                </Col>
                <Col span={1} />
            </Row>
        </Form>
    );
};
