import { useCallback, useEffect, useState } from 'react';

import { addEdge, applyEdgeChanges, applyNodeChanges } from '@xyflow/react';

import { mapEventEmitter, NODE_ADDED } from '../events';

export const useMapNodes = (mapData) => {
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [selectedNodeId, setSelectedNodeId] = useState(null);
    const [selectedEdgeId, setSelectedEdgeId] = useState(null);

    useEffect(() => {
        if (mapData) {
            setNodes(JSON.parse(JSON.stringify(mapData.nodes || [])));
            setEdges(JSON.parse(JSON.stringify(mapData.edges || [])));
        }
    }, [mapData]);

    const onNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        [],
    );

    const onEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        [],
    );

    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge(params, eds)),
        [],
    );

    const addNode = useCallback((nodeType = 'C') => {
        let newId = '';

        setNodes((nds) => {
            const typeNames = {
                C: 'Claim',
                E: 'Evidence',
                R: 'Reasoning',
            };

            const typePrefix = {
                C: 'c',
                E: 'e',
                R: 'r',
            };

            const prefix = typePrefix[nodeType];

            const sameTypeNodes = nds.filter((node) => node.id.startsWith(prefix));

            const maxNumber = sameTypeNodes.reduce((max, node) => {
                const match = node.id.match(/^[cer](\d+)$/);
                if (match) {
                    const num = parseInt(match[1], 10);
                    return Math.max(max, num);
                }
                return max;
            }, 0);

            const newNumber = maxNumber + 1;
            newId = `${prefix}${newNumber}`;

            const newNode = {
                id: newId,
                type: 'baseNode',
                position: { x: 50, y: 80 },
                data: {
                    type: nodeType,
                    content: `${typeNames[nodeType]} content...`,
                },
            };

            return [...nds, newNode];
        });

        mapEventEmitter.emit(NODE_ADDED, { nodeType, nodeId: newId });

        setSelectedNodeId(newId);
    }, []);

    const selectNode = useCallback((nodeId) => {
        setSelectedNodeId(nodeId);
        setSelectedEdgeId(null);
    }, []);

    const selectEdge = useCallback((edgeId) => {
        setSelectedEdgeId(edgeId);
        setSelectedNodeId(null);
    }, []);

    const updateNodeContent = useCallback((nodeId, content) => {
        setNodes((nds) => nds.map((node) => (node.id === nodeId
            ? { ...node, data: { ...node.data, content } }
            : node)));
    }, []);

    const updateNodeStyle = useCallback((nodeId, styleUpdates) => {
        setNodes((nds) => nds.map((node) => (node.id === nodeId
            ? { ...node, data: { ...node.data, ...styleUpdates } }
            : node)));
    }, []);

    const deleteNode = useCallback((nodeId) => {
        setNodes((nds) => nds.filter((node) => node.id !== nodeId));
        setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
        setSelectedNodeId(null);
    }, []);

    const deleteEdge = useCallback((edgeId) => {
        setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
        setSelectedEdgeId(null);
    }, []);

    const selectedNode = nodes.find((node) => node.id === selectedNodeId);
    const selectedEdge = edges.find((edge) => edge.id === selectedEdgeId);

    return {
        nodes,
        edges,
        setEdges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        addNode,
        selectedNodeId,
        selectNode,
        selectedEdgeId,
        selectEdge,
        updateNodeContent,
        updateNodeStyle,
        selectedNode,
        selectedEdge,
        deleteNode,
        deleteEdge,
    };
};
