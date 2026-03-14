import { useEffect, useRef, useState } from 'react';

import {
    Background,
    ConnectionMode,
    Controls,
    ReactFlow,
    useUpdateNodeInternals,
} from '@xyflow/react';
import { Spin } from 'antd';
import throttle from 'lodash.throttle';

import { NEUTRAL_COLORS } from '../../constants/colors';

import { BaseNode } from './components/nodes';
import { useMapContext } from './hooks';

const nodeTypes = {
    baseNode: BaseNode,
};

const UpdateNodeInternals = ({ nodes }) => {
    const updateNodeInternals = useUpdateNodeInternals();

    useEffect(() => {
        nodes.forEach((node) => {
            updateNodeInternals(node.id);
        });
    }, [nodes, updateNodeInternals]);

    return null;
};

export const BaseMap = ({ readOnly = false }) => {
    const {
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        selectNode,
        selectEdge,
    } = useMapContext();

    const reactFlowInstanceRef = useRef(null);
    const containerRef = useRef(null);
    const observerRef = useRef(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (!containerRef.current) return undefined;

        // 使用 throttle 限制 resize 事件的呼叫頻率
        const handleResize = throttle((entries) => {
            if (!entries || entries.length === 0) return;
            const { width, height } = entries[0].contentRect;

            // 如果寬高有效 (大於 0)，設定 isReady 為 true，讓 ReactFlow 準備好掛載
            if (width > 0 && height > 0) {
                if (!isReady) {
                    setIsReady(true);
                }
                // 只有在實體存在且也準備好的時候才呼叫 fitView
                if (reactFlowInstanceRef.current && nodes.length > 0) {
                    reactFlowInstanceRef.current.fitView({ duration: 200 });
                }
            }
        }, 100);

        observerRef.current = new ResizeObserver(handleResize);
        observerRef.current.observe(containerRef.current);

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
            handleResize.cancel();
        };
    }, [nodes.length, isReady]);

    return (
        <div
            ref={containerRef}
            style={{ height: '100%', width: '100%', backgroundColor: NEUTRAL_COLORS.white }}
        >
            {!isReady && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Spin />
                </div>
            )}
            {isReady && (
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    fitView
                    onInit={(instance) => {
                        reactFlowInstanceRef.current = instance;
                    }}
                    onNodesChange={readOnly ? undefined : onNodesChange}
                    onEdgesChange={readOnly ? undefined : onEdgesChange}
                    onConnect={readOnly ? undefined : onConnect}
                    onNodeClick={readOnly ? undefined : (e, n) => selectNode(n.id)}
                    onEdgeClick={readOnly ? undefined : (e, edge) => selectEdge(edge.id)}
                    onPaneClick={readOnly ? undefined : () => {
                        selectNode(null);
                        selectEdge(null);
                    }}
                    connectionMode={ConnectionMode.Loose}
                    proOptions={{ hideAttribution: true }}
                    deleteKeyCode={readOnly ? null : 'Backspace'}
                    nodesDraggable={!readOnly}
                    nodesConnectable={!readOnly}
                    elementsSelectable={!readOnly}
                    zoomOnDoubleClick={!readOnly}
                    panOnDrag
                    zoomOnScroll
                    zoomOnPinch
                >
                    <Background />
                    {!readOnly && <Controls showInteractive={false} />}
                    <UpdateNodeInternals nodes={nodes} />
                </ReactFlow>
            )}
        </div>
    );
};
