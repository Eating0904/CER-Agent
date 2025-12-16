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

export const BaseMap = () => {
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
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={(e, n) => selectNode(n.id)}
                onEdgeClick={(e, edge) => selectEdge(edge.id)}
                onPaneClick={() => {
                    selectNode(null);
                    selectEdge(null);
                }}
                connectionMode={ConnectionMode.Loose}
                proOptions={{ hideAttribution: true }}
                deleteKeyCode={null}
            >
                <Background />
                <Controls showInteractive={false} />
                <UpdateNodeInternals nodes={nodes} />
            </ReactFlow>
        </div>
    );
};
