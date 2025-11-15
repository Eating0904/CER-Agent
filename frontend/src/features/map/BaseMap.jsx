import { useCallback, useEffect, useState } from 'react';

import {
    addEdge,
    applyEdgeChanges,
    applyNodeChanges,
    Background,
    ConnectionMode,
    Controls,
    ReactFlow,
} from '@xyflow/react';

import { BaseNode } from './BaseNode';

const nodeTypes = {
    baseNode: BaseNode,
};

export const BaseMap = ({ mapData }) => {
    const [nodes, setNodes] = useState(mapData?.nodes || []);
    const [edges, setEdges] = useState(mapData?.edges || []);

    useEffect(() => {
        if (mapData) {
            setNodes(mapData.nodes || []);
            setEdges(mapData.edges || []);
        }
    }, [mapData]);

    const onNodesChange = useCallback(
        (changes) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
        [],
    );

    const onEdgesChange = useCallback(
        (changes) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
        [],
    );

    const onConnect = useCallback(
        (params) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
        [],
    );

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
                connectionMode={ConnectionMode.Loose}
                // onNodeClick={onNodeClick}
            >
                <Background />
                <Controls />
            </ReactFlow>
        </div>
    );
};
