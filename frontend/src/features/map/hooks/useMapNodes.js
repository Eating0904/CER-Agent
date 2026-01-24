import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';

import { addEdge, applyEdgeChanges, applyNodeChanges } from '@xyflow/react';

import {
    EDGE_CONNECTED,
    EDGE_DELETED,
    mapEventEmitter,
    NODE_DELETED,
    NODE_EDITED,
} from '../events';

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
                        action: 'edit',
                        node_id: prevNodeId,
                        node_type: prevNode.data.type,
                        original_content: editingNodeSnapshot.current.content,
                        updated_content: prevNode.data.content,
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

            setNodes((nds) => {
                const sourceNode = nds.find((n) => n.id === params.source);
                const targetNode = nds.find((n) => n.id === params.target);

                mapEventEmitter.emit(EDGE_CONNECTED, {
                    action: 'connect',
                    connected_nodes: [params.source, params.target],
                    nodes_content: {
                        [params.source]: sourceNode?.data?.content || '',
                        [params.target]: targetNode?.data?.content || '',
                    },
                    newEdges,
                });

                return nds;
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

        return newId;
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
        // 在刪除前收集資訊
        const nodeToDelete = nodes.find((node) => node.id === nodeId);
        if (!nodeToDelete) return;

        // 找出所有與此節點相關的其他節點
        const deletedConnections = [];
        edges.forEach((edge) => {
            if (edge.source === nodeId) {
                const targetNode = nodes.find((n) => n.id === edge.target);
                if (targetNode) {
                    deletedConnections.push({
                        node_id: edge.target,
                        node_content: targetNode.data.content,
                    });
                }
            }
            else if (edge.target === nodeId) {
                const sourceNode = nodes.find((n) => n.id === edge.source);
                if (sourceNode) {
                    deletedConnections.push({
                        node_id: edge.source,
                        node_content: sourceNode.data.content,
                    });
                }
            }
        });

        // 觸發刪除事件
        mapEventEmitter.emit(NODE_DELETED, {
            action: 'delete_node',
            node_id: nodeId,
            node_type: nodeToDelete.data.type,
            node_content: nodeToDelete.data.content,
            deleted_connections: deletedConnections,
        });

        // 執行刪除
        setNodes((nds) => nds.filter((node) => node.id !== nodeId));
        setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
        setSelectedNodeId(null);
    }, [nodes, edges]);

    const deleteEdge = useCallback((edgeId) => {
        // 在刪除前收集資訊
        const edgeToDelete = edges.find((edge) => edge.id === edgeId);
        if (!edgeToDelete) return;

        // 取得連接的兩個節點的內容
        const sourceNode = nodes.find((n) => n.id === edgeToDelete.source);
        const targetNode = nodes.find((n) => n.id === edgeToDelete.target);

        // 觸發刪除事件
        mapEventEmitter.emit(EDGE_DELETED, {
            action: 'delete_edge',
            connected_nodes: [edgeToDelete.source, edgeToDelete.target],
            nodes_content: {
                [edgeToDelete.source]: sourceNode?.data?.content || '',
                [edgeToDelete.target]: targetNode?.data?.content || '',
            },
        });

        // 執行刪除
        setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
        setSelectedEdgeId(null);
    }, [edges, nodes]);

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
