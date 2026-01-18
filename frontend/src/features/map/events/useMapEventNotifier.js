import { useEffect } from 'react';

import { mapEventEmitter } from './mapEventEmitter';
import {
    EDGE_CONNECTED,
    EDGE_DELETED,
    NODE_DELETED,
    NODE_EDITED,
} from './mapEventTypes';

export const useMapEventNotifier = (onEvent) => {
    useEffect(() => {
        const handleNodeEdited = (event) => {
            if (onEvent) {
                onEvent(event.detail);
            }
        };

        const handleEdgeConnected = (event) => {
            if (onEvent) {
                onEvent(event.detail);
            }
        };

        const handleNodeDeleted = (event) => {
            if (onEvent) {
                onEvent(event.detail);
            }
        };

        const handleEdgeDeleted = (event) => {
            if (onEvent) {
                onEvent(event.detail);
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
        const unsubscribeNodeDeleted = mapEventEmitter.subscribe(NODE_DELETED, handleNodeDeleted);
        const unsubscribeEdgeDeleted = mapEventEmitter.subscribe(EDGE_DELETED, handleEdgeDeleted);

        return () => {
            unsubscribeNodeEdited();
            unsubscribeEdgeConnected();
            unsubscribeNodeDeleted();
            unsubscribeEdgeDeleted();
        };
    }, [onEvent]);
};
