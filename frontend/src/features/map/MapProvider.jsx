import { MapContext } from './hooks/useMapContext';

export const MapProvider = ({ children, value }) => (
    <MapContext.Provider value={value}>
        {children}
    </MapContext.Provider>
);
