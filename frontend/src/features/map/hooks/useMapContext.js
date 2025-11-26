import { createContext, useContext } from 'react';

export const MapContext = createContext(null);

export const useMapContext = () => {
    const context = useContext(MapContext);
    if (!context) {
        throw new Error('useMapContext must be used within MapProvider');
    }
    return context;
};
