import { useCallback, useEffect, useState } from 'react';

import { addEdge, applyEdgeChanges, applyNodeChanges } from '@xyflow/react';

export const useMapNodes = (mapData) => {
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);

    useEffect(() => {
        if (mapData) {
            setNodes(mapData.nodes || []);
            setEdges(mapData.edges || []);
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
            const newId = `${prefix}${newNumber}`;

            const newNode = {
                id: newId,
                type: 'baseNode',
                position: { x: Math.random() * 300, y: Math.random() * 100 },
                data: {
                    type: nodeType,
                    content: `${typeNames[nodeType]} content...`,
                },
            };

            return [...nds, newNode];
        });
    }, []);

    return {
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        addNode,
    };
};
