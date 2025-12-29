import { useEffect } from 'react';

import { mapEventEmitter } from './mapEventEmitter';
import { NODE_EDITED } from './mapEventTypes';

export const useMapEventNotifier = (onNodeEdited) => {
    useEffect(() => {
        const handleNodeEdited = (event) => {
            const { nodeType, nodeId } = event.detail;

            if (onNodeEdited) {
                onNodeEdited({ nodeType, nodeId });
            }
        };

        const unsubscribe = mapEventEmitter.subscribe(NODE_EDITED, handleNodeEdited);
        return unsubscribe;
    }, [onNodeEdited]);
};
