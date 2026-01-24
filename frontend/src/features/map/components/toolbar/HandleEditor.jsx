import { useEffect, useState } from 'react';

import { App, Checkbox } from 'antd';
import { useSearchParams } from 'react-router-dom';

import { DEFAULT_COLORS, NEUTRAL_COLORS } from '../../../../constants/colors';
import { useUserActionTracker } from '../../../userAction/hooks';
import { useMapContext } from '../../hooks';

export const HandleEditor = () => {
    const { modal } = App.useApp();
    const { selectedNode, updateNodeStyle, edges, setEdges } = useMapContext();
    const [searchParams] = useSearchParams();
    const mapId = searchParams.get('mapId');
    const { trackAction } = useUserActionTracker();

    const [handles, setHandles] = useState({
        topLeft: false,
        top: false,
        topRight: false,
        left: false,
        right: false,
        bottomLeft: false,
        bottom: false,
        bottomRight: false,
    });

    // 當選中的 Node 改變時，更新 checkbox 狀態
    useEffect(() => {
        if (selectedNode) {
            const showDots = selectedNode.data.showDots || ['top', 'bottom'];
            const newHandles = {
                topLeft: showDots.includes('topLeft'),
                top: showDots.includes('top'),
                topRight: showDots.includes('topRight'),
                left: showDots.includes('left'),
                right: showDots.includes('right'),
                bottomLeft: showDots.includes('bottomLeft'),
                bottom: showDots.includes('bottom'),
                bottomRight: showDots.includes('bottomRight'),
            };
            setHandles(newHandles);
        }
    }, [selectedNode]);

    const isDisabled = !selectedNode;

    // 檢查某個連接點是否有 edge 連接
    const getConnectedEdges = (nodeId, handleId) => {
        if (!edges) return [];

        return edges.filter((edge) => {
            const isSourceHandle = edge.source === nodeId && edge.sourceHandle === handleId;
            const isTargetHandle = edge.target === nodeId && edge.targetHandle === handleId;
            return isSourceHandle || isTargetHandle;
        });
    };

    // 更新連接點狀態
    const updateHandleState = (handleId) => {
        const isCurrentlyChecked = handles[handleId];
        const operation = isCurrentlyChecked ? 'uncheck' : 'check';

        const newHandles = {
            ...handles,
            [handleId]: !handles[handleId],
        };
        setHandles(newHandles);

        // 將勾選的連接點轉換為陣列
        const showDots = Object.entries(newHandles)
            .filter(([, isChecked]) => isChecked)
            .map(([id]) => id);

        // 更新 Node 的 showDots 屬性
        updateNodeStyle(selectedNode.id, {
            showDots,
        });

        // 記錄調整 handle 行為
        trackAction('adjust_handle', {
            node_id: selectedNode.id,
            handle_id: handleId,
            operation,
        }, mapId ? parseInt(mapId, 10) : null);
    };

    // 處理 checkbox 狀態改變
    const handleCheckboxChange = (handleId) => {
        if (!selectedNode) return;

        const isCurrentlyChecked = handles[handleId];
        const willBeUnchecked = isCurrentlyChecked;

        // 如果要取消勾選，檢查是否有 edge 連接
        if (willBeUnchecked) {
            const connectedEdges = getConnectedEdges(selectedNode.id, handleId);

            if (connectedEdges.length > 0) {
                modal.confirm({
                    title: 'Delete Handle',
                    content: `This handle has ${connectedEdges.length} connections. Unchecking it will also delete these connections. Do you want to proceed?`,
                    okText: 'Confirm',
                    okType: 'primary',
                    cancelText: 'Cancel',
                    onOk: () => {
                        // 使用者確認，刪除 edges 並更新連接點
                        const edgeIdsToRemove = connectedEdges.map((edge) => edge.id);
                        const updatedEdges = edges.filter(
                            (edge) => !edgeIdsToRemove.includes(edge.id),
                        );
                        setEdges(updatedEdges);

                        // 更新連接點狀態
                        updateHandleState(handleId);
                    },
                });
                return;
            }
        }

        // 沒有連接的 edge，直接更新
        updateHandleState(handleId);
    };

    return (
        <div style={{ height: 'calc(100% - 19px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div
                style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {/* 中央矩形 - 模擬 Node */}
                <div
                    style={{
                        position: 'absolute',
                        top: '15px',
                        bottom: '15px',
                        left: '8px',
                        right: '8px',
                        border: `1px solid ${DEFAULT_COLORS.inputBorder}`,
                        borderRadius: '4px',
                        backgroundColor: NEUTRAL_COLORS.white,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        color: NEUTRAL_COLORS.gray400,
                        zIndex: 1,
                    }}
                >
                    Node
                </div>

                {/* 上排 checkbox */}
                <Checkbox
                    checked={handles.topLeft}
                    disabled={isDisabled}
                    onChange={() => handleCheckboxChange('topLeft')}
                    style={{
                        position: 'absolute',
                        top: '7px',
                        left: '22.5%',
                        transform: 'translateX(-50%)',
                        zIndex: 2,
                    }}
                />
                <Checkbox
                    checked={handles.top}
                    disabled={isDisabled}
                    onChange={() => handleCheckboxChange('top')}
                    style={{
                        position: 'absolute',
                        top: '7px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 2,
                    }}
                />
                <Checkbox
                    checked={handles.topRight}
                    disabled={isDisabled}
                    onChange={() => handleCheckboxChange('topRight')}
                    style={{
                        position: 'absolute',
                        top: '7px',
                        left: '77.5%',
                        transform: 'translateX(-50%)',
                        zIndex: 2,
                    }}
                />

                {/* 左右 checkbox */}
                <Checkbox
                    checked={handles.left}
                    disabled={isDisabled}
                    onChange={() => handleCheckboxChange('left')}
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '0',
                        transform: 'translateY(-50%)',
                        zIndex: 2,
                    }}
                />
                <Checkbox
                    checked={handles.right}
                    disabled={isDisabled}
                    onChange={() => handleCheckboxChange('right')}
                    style={{
                        position: 'absolute',
                        top: '50%',
                        right: '0',
                        transform: 'translateY(-50%)',
                        zIndex: 2,
                    }}
                />

                {/* 下排 checkbox */}
                <Checkbox
                    checked={handles.bottomLeft}
                    disabled={isDisabled}
                    onChange={() => handleCheckboxChange('bottomLeft')}
                    style={{
                        position: 'absolute',
                        bottom: '7px',
                        left: '22.5%',
                        transform: 'translateX(-50%)',
                        zIndex: 2,
                    }}
                />
                <Checkbox
                    checked={handles.bottom}
                    disabled={isDisabled}
                    onChange={() => handleCheckboxChange('bottom')}
                    style={{
                        position: 'absolute',
                        bottom: '7px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 2,
                    }}
                />
                <Checkbox
                    checked={handles.bottomRight}
                    disabled={isDisabled}
                    onChange={() => handleCheckboxChange('bottomRight')}
                    style={{
                        position: 'absolute',
                        bottom: '7px',
                        left: '77.5%',
                        transform: 'translateX(-50%)',
                        zIndex: 2,
                    }}
                />
            </div>
        </div>
    );
};
