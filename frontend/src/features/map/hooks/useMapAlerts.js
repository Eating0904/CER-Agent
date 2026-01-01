import { useCallback, useState } from 'react';

/**
 * Map Alerts 管理 Hook
 *
 * @returns {{ alerts: Array, addAlert: Function, updateAlert: Function, setAlerts: Function }}
 */
export const useMapAlerts = () => {
    const [alerts, setAlerts] = useState([]);

    const addAlert = useCallback((alertData) => {
        const alertId = Date.now();
        const newAlert = {
            id: alertId,
            ...alertData,
        };

        setAlerts((prev) => [newAlert, ...prev]);

        return alertId;
    }, []);

    const updateAlert = useCallback((alertId, updates) => {
        setAlerts((prev) => prev.map((alert) => {
            if (alert.id === alertId) {
                return { ...alert, ...updates };
            }
            return alert;
        }));
    }, []);

    return { alerts, setAlerts, addAlert, updateAlert };
};
