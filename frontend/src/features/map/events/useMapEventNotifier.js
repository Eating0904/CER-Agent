import { useEffect } from 'react';

import { mapEventEmitter } from './mapEventEmitter';
import { EDGE_CONNECTED, NODE_EDITED } from './mapEventTypes';

export const useMapEventNotifier = (onEvent) => {
    useEffect(() => {
        const handleNodeEdited = (event) => {
            const { nodeType, nodeId } = event.detail;

            if (onEvent) {
                onEvent({
                    action: 'edit',
                    node_id: nodeId,
                    node_type: nodeType,
                });
            }
        };

        const handleEdgeConnected = (event) => {
            const { sourceNodeId, targetNodeId } = event.detail;

            if (onEvent) {
                onEvent({
                    action: 'connect',
                    connected_nodes: [sourceNodeId, targetNodeId],
                });
            }
        };

        const unsubscribeNodeEdited = mapEventEmitter.subscribe(
            NODE_EDITED,
            handleNodeEdited,
        );
        const unsubscribeEdgeConnected = mapEventEmitter.subscribe(
            EDGE_CONNECTED,
            handleEdgeConnected,
        );

        return () => {
            unsubscribeNodeEdited();
            unsubscribeEdgeConnected();
        };
    }, [onEvent]);
};
