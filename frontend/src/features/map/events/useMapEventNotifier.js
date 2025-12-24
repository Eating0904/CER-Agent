import { useEffect } from 'react';

import { mapEventEmitter } from './mapEventEmitter';
import { NODE_ADDED } from './mapEventTypes';

export const useMapEventNotifier = () => {
    useEffect(() => {
        const handleNodeAdded = (event) => {
            const { nodeType, nodeId } = event.detail;
            const typeMap = { C: 'claim', E: 'evidence', R: 'reasoning' };
            console.log(`使用者新增了一個 ${typeMap[nodeType]} node (id: ${nodeId})`);
        };

        const unsubscribe = mapEventEmitter.subscribe(NODE_ADDED, handleNodeAdded);
        return unsubscribe;
    }, []);
};
