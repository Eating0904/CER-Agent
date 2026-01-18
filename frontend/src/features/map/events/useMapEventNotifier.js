import { useEffect } from 'react';

import { mapEventEmitter } from './mapEventEmitter';
import { EDGE_CONNECTED, NODE_EDITED } from './mapEventTypes';

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
