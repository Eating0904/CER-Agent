import { MapContext } from './useMapContext';

export const MapProvider = ({ children, value }) => (
    <MapContext.Provider value={value}>
        {children}
    </MapContext.Provider>
);
