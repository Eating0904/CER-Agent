import {
    Background,
    ConnectionMode,
    Controls,
    ReactFlow,
} from '@xyflow/react';

import { BaseNode } from './BaseNode';
import { useMapContext } from './useMapContext';

const nodeTypes = {
    baseNode: BaseNode,
};

export const BaseMap = () => {
    const {
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        selectNode,
    } = useMapContext();

    return (
        <div style={{ height: '100%', width: '100%', backgroundColor: 'white' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                fitView
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={(e, n) => selectNode(n.id)}
                onEdgeClick={() => selectNode(null)}
                onPaneClick={() => selectNode(null)}
                connectionMode={ConnectionMode.Loose}
            >
                <Background />
                <Controls />
            </ReactFlow>
        </div>
    );
};
