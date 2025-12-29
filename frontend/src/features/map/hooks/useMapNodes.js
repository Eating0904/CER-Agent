import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';

import { addEdge, applyEdgeChanges, applyNodeChanges } from '@xyflow/react';

import { EDGE_CONNECTED, mapEventEmitter, NODE_EDITED } from '../events';

export const useMapNodes = (mapData) => {
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [selectedNodeId, setSelectedNodeId] = useState(null);
    const [selectedEdgeId, setSelectedEdgeId] = useState(null);

    const prevSelectedNodeIdRef = useRef(null);
    const editingNodeSnapshot = useRef(null);

    useEffect(() => {
        if (mapData) {
            setNodes(JSON.parse(JSON.stringify(mapData.nodes || [])));
            setEdges(JSON.parse(JSON.stringify(mapData.edges || [])));
        }
    }, [mapData]);

    useEffect(() => {
        const prevNodeId = prevSelectedNodeIdRef.current;

        // 比較前一個選取的節點內容是否有變更
        // TODO: 差異的幅度需要再討論
        if (prevNodeId && prevNodeId !== selectedNodeId) {
            if (editingNodeSnapshot.current) {
                const prevNode = nodes.find((n) => n.id === prevNodeId);
                if (prevNode && prevNode.data.content !== editingNodeSnapshot.current.content) {
                    mapEventEmitter.emit(NODE_EDITED, {
                        nodeType: prevNode.data.type,
                        nodeId: prevNodeId,
                    });
                }
            }
        }

        prevSelectedNodeIdRef.current = selectedNodeId;

        // 建立目前選取節點的快照
        if (selectedNodeId) {
            const currentNode = nodes.find((n) => n.id === selectedNodeId);
            if (currentNode) {
                editingNodeSnapshot.current = { content: currentNode.data.content };
            }
        }
        else {
            editingNodeSnapshot.current = null;
        }
    }, [selectedNodeId]);

    const onNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        [],
    );

    const onEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        [],
    );

    const onConnect = useCallback(
        (params) => {
            let newEdges;
            setEdges((eds) => {
                newEdges = addEdge(params, eds);
                return newEdges;
            });

            mapEventEmitter.emit(EDGE_CONNECTED, {
                sourceNodeId: params.source,
                targetNodeId: params.target,
                newEdges,
            });
        },
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
