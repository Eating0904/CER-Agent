import {
    useCallback, useEffect, useRef, useState,
} from 'react';

import { addEdge, applyEdgeChanges, applyNodeChanges } from '@xyflow/react';
import { useSearchParams } from 'react-router-dom';

import { useUserActionTracker } from '../../userAction/hooks';
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

    const [searchParams] = useSearchParams();
    const mapId = searchParams.get('mapId');
    const { trackAction } = useUserActionTracker();

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

            // 更新 snapshot
            const currentNode = nodes.find((n) => n.id === selectedNodeId);
            if (currentNode) {
                editingNodeSnapshot.current = {
                    content: currentNode.data.content,
                };
            }
            else {
                editingNodeSnapshot.current = null;
            }
        }

        // 更新 ref
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
    }, [selectedNodeId, nodes]);

    // 定義 deleteEdge
    const deleteEdge = useCallback((edgeId, reasoning = 'manual_delete') => {
        // 在刪除前收集資訊
        const edgeToDelete = edges.find((edge) => edge.id === edgeId);
        if (!edgeToDelete) return;

        // 取得連接的兩個節點的內容
        const sourceNode = nodes.find((n) => n.id === edgeToDelete.source);
        const targetNode = nodes.find((n) => n.id === edgeToDelete.target);

        // 記錄追蹤
        trackAction(
            'delete_edge',
            {
                edge_id: edgeId,
                node1: edgeToDelete.source,
                node2: edgeToDelete.target,
                reasoning,
            },
            mapId ? parseInt(mapId, 10) : null,
        );

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
    }, [edges, nodes, trackAction, mapId]);

    const onNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        [],
    );

    const onEdgesChange = useCallback(
        (changes) => {
            // 攔截 remove 類型的變化，調用 deleteEdge 統一處理
            changes.forEach((change) => {
                if (change.type === 'remove') {
                    deleteEdge(change.id, 'manual_delete');
                }
            });

            // 過濾掉 remove 類型，因為已經由 deleteEdge 處理
            const nonRemoveChanges = changes.filter((change) => change.type !== 'remove');
            if (nonRemoveChanges.length > 0) {
                setEdges((eds) => applyEdgeChanges(nonRemoveChanges, eds));
            }
        },
        [deleteEdge],
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

                // 記錄建立 edge 的追蹤
                trackAction(
                    'add_edge',
                    {
                        edge_id: newEdges[newEdges.length - 1].id,
                        node1: params.source,
                        node2: params.target,
                    },
                    mapId ? parseInt(mapId, 10) : null,
                );

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
        [trackAction, mapId],
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

        // 刪除相關的 edges
        const affectedEdges = edges.filter(
            (edge) => edge.source === nodeId || edge.target === nodeId,
        );
        affectedEdges.forEach((edge) => {
            deleteEdge(edge.id, 'node_deleted');
        });

        // 執行刪除 node
        setNodes((nds) => nds.filter((node) => node.id !== nodeId));
        setSelectedNodeId(null);
    }, [nodes, edges, deleteEdge]);

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
