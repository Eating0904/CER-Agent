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

const createInitialNodes = (topicContent = '') => [
    {
        id: 'topic',
        position: { x: 80, y: 150 },
        data: {
            content: topicContent,
            showDots: ['bottom', 'left', 'right'],
            customSize: { width: '200px' },
        },
        type: 'baseNode',
    },
    {
        id: 'claim',
        position: { x: 0, y: 100 },
        data: {
            content: 'Claim',
            customColor: {
                backgroundColor: '#D9F2D0',
                borderColor: '#00AE4C',
                dotColor: '#00AE4C',
            },
        },
        type: 'baseNode',
    },
    {
        id: 'evidence',
        position: { x: 300, y: 100 },
        data: {
            content: 'Evidence',
            customColor: {
                backgroundColor: '#FFEDCD',
                borderColor: '#EBA62B',
                dotColor: '#EBA62B',
            },
        },
        type: 'baseNode',
    },
    {
        id: 'reasoning',
        position: { x: 146, y: 230 },
        data: {
            content: 'Reasoning',
            customColor: {
                backgroundColor: '#DBE9F7',
                borderColor: '#0070C0',
                dotColor: '#0070C0',
            },
        },
        type: 'baseNode',
    },
];

const initialEdges = [
    {
        id: 'topic-claim',
        source: 'topic',
        target: 'claim',
        sourceHandle: 'left',
        targetHandle: 'bottom',
    },
    {
        id: 'topic-evidence',
        source: 'topic',
        target: 'evidence',
        sourceHandle: 'right',
        targetHandle: 'bottom',
    },
    {
        id: 'topic-reasoning',
        source: 'topic',
        target: 'reasoning',
        sourceHandle: 'bottom',
        targetHandle: 'top',
    },
];

export const BaseMap = ({ topic }) => {
    const [nodes, setNodes] = useState(createInitialNodes(topic));
    const [edges, setEdges] = useState(initialEdges);

    useEffect(() => {
        if (topic) {
            setNodes(createInitialNodes(topic));
        }
    }, [topic]);

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
