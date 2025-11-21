import {
    Background,
    ConnectionMode,
    Controls,
    ReactFlow,
} from '@xyflow/react';

import { BaseNode } from './BaseNode';

const nodeTypes = {
    baseNode: BaseNode,
};

export const BaseMap = ({ nodes, edges, onNodesChange, onEdgesChange, onConnect }) => (
    <div style={{ height: '100%', width: '100%', backgroundColor: 'white' }}>
        <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            connectionMode={ConnectionMode.Loose}
            // onNodeClick={onNodeClick}
        >
            <Background />
            <Controls />
        </ReactFlow>
    </div>
);
