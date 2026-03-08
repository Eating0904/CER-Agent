import { useState } from 'react';

import { Form } from 'antd';

import { useGetViewMapsQuery } from './mapViewApi';
import { MapViewFilter } from './MapViewFilter';
import { MapViewModal } from './MapViewModal';
import { MapViewTable } from './MapViewTable';

export const MapView = () => {
    const [form] = Form.useForm();
    const [searchParams, setSearchParams] = useState({});
    const [selectedMap, setSelectedMap] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data: maps = [], isLoading } = useGetViewMapsQuery(searchParams);

    const handleSearch = () => {
        const values = form.getFieldsValue();
        const params = {};
        if (values.username) params.username = values.username;
        if (values.map_id) params.map_id = values.map_id;
        if (values.map_name) params.map_name = values.map_name;
        if (values.template_id) params.template_id = values.template_id;
        setSearchParams(params);
    };

    const handleReset = () => {
        form.resetFields();
        setSearchParams({});
    };

    const handleView = (record, index) => {
        setSelectedMap(record);
        setSelectedIndex(index);
        setIsModalOpen(true);
    };

    return (
        <div style={{ padding: '0 8px' }}>
            <MapViewFilter form={form} onSearch={handleSearch} onReset={handleReset} />
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <MapViewTable maps={maps} isLoading={isLoading} onView={handleView} />
            </div>
            <MapViewModal
                open={isModalOpen}
                mapData={selectedMap}
                tableIndex={selectedIndex}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedMap(null);
                    setSelectedIndex(null);
                }}
            />
        </div>
    );
};
