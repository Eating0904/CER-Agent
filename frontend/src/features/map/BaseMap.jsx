import { useEffect } from 'react';

import {
    Background,
    ConnectionMode,
    Controls,
    ReactFlow,
    useUpdateNodeInternals,
} from '@xyflow/react';

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

    return (
        <div style={{ height: '100%', width: '100%', backgroundColor: NEUTRAL_COLORS.white }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                fitView
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
