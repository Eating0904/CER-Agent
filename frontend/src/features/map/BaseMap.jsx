import { useEffect, useRef } from 'react';

import {
    Background,
    ConnectionMode,
    Controls,
    ReactFlow,
    useUpdateNodeInternals,
} from '@xyflow/react';
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

    useEffect(() => {
        if (!containerRef.current) return undefined;

        // 使用 throttle 限制 fitView 的呼叫頻率
        const handleResize = throttle(() => {
            if (reactFlowInstanceRef.current && nodes.length > 0) {
                reactFlowInstanceRef.current.fitView({ duration: 200 });
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
    }, [nodes.length]);

    return (
        <div
            ref={containerRef}
            style={{ height: '100%', width: '100%', backgroundColor: NEUTRAL_COLORS.white }}
        >
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
        </div>
    );
};
