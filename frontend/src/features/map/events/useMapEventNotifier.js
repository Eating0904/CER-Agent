import { useEffect } from 'react';

import { mapEventEmitter } from './mapEventEmitter';
import { NODE_EDITED } from './mapEventTypes';

export const useMapEventNotifier = (onNodeEdited) => {
    useEffect(() => {
        const handleNodeEdited = (event) => {
            const { nodeType, nodeId } = event.detail;
            const typeMap = { C: 'claim', E: 'evidence', R: 'reasoning' };
            const message = `使用者編輯了 ${typeMap[nodeType]} node (id: ${nodeId})`;

            if (onNodeEdited) {
                onNodeEdited(message);
            }
        };

        const unsubscribe = mapEventEmitter.subscribe(NODE_EDITED, handleNodeEdited);
        return unsubscribe;
    }, [onNodeEdited]);
};
