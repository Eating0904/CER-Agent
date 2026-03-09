import { useEffect, useMemo, useState } from 'react';

import { Modal, Spin, Typography } from 'antd';
import Split from 'react-split';

import { EssayEditor } from '../essay/EssayEditor';
import { BaseMap } from '../map/BaseMap';
import { MapProvider } from '../map/MapProvider';

import { useLazyGetViewEssayQuery, useLazyGetViewMapQuery } from './mapViewApi';

const { Text } = Typography;

const ModalContent = ({ mapId }) => {
    const [essayContent, setEssayContent] = useState('');

    const [fetchMap, { data: mapData, isLoading: isMapLoading }] = useLazyGetViewMapQuery();
    const [fetchEssay, { data: essayData, isLoading: isEssayLoading }] = useLazyGetViewEssayQuery();

    useEffect(() => {
        if (mapId) {
            fetchMap(mapId);
            fetchEssay(mapId);
        }
    }, [mapId, fetchMap, fetchEssay]);

    useEffect(() => {
        if (essayData?.essay?.content !== undefined) {
            setEssayContent(essayData.essay.content);
        }
        else {
            setEssayContent('');
        }
    }, [essayData]);

    const mapContext = useMemo(() => ({
        nodes: mapData?.nodes || [],
        edges: mapData?.edges || [],
    }), [mapData?.nodes, mapData?.edges]);

    if (isMapLoading || isEssayLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ height: '100%', display: 'flex' }}>
            <Split
                sizes={[50, 50]}
                minSize={200}
                gutterSize={8}
                style={{ display: 'flex', height: '100%', width: '100%' }}
            >
                {/* 左側面板 - 心智圖預覽 */}
                <div style={{ height: '100%', backgroundColor: '#f5f5f5', position: 'relative' }}>
                    <MapProvider value={mapContext}>
                        <BaseMap readOnly />
                    </MapProvider>
                </div>

                {/* 右側面板 - Essay（唯讀） */}
                <div style={{ height: '100%', position: 'relative' }}>
                    {essayData?.essay ? (
                        <EssayEditor
                            essayContent={essayContent}
                            setEssayContent={() => {}}
                            editorRef={null}
                            disabled
                        />
                    ) : (
                        <div style={{
                            height: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: '#f0f2f5',
                        }}
                        >
                            <Text type="secondary">No essay yet.</Text>
                        </div>
                    )}
                </div>
            </Split>
        </div>
    );
};

export const MapViewModal = ({ open, mapData, tableIndex, onClose }) => {
    const [openKey, setOpenKey] = useState(0);

    const practiceLabel = mapData
        ? `PracticeID-${mapData.id} ${mapData.name ?? ''}`
        : '';
    const taskLabel = mapData?.template
        ? `TaskID-${mapData.template.id} ${mapData.template.name}`
        : '';
    const title = mapData
        ? `#${tableIndex}: ${mapData.user?.username ?? ''} / ${practiceLabel} / ${taskLabel}`
        : 'View';

    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            width="95vw"
            style={{ top: 20 }}
            styles={{ body: { height: 'calc(95vh - 110px)', padding: 0, overflow: 'hidden' } }}
            title={title}
            afterOpenChange={(isOpen) => {
                if (isOpen) setOpenKey((k) => k + 1);
            }}
        >
            {open && mapData && (
                <ModalContent key={`${mapData.id}-${openKey}`} mapId={mapData.id} />
            )}
        </Modal>
    );
};
