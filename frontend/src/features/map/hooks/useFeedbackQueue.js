import { useCallback, useRef } from 'react';

import { useSearchParams } from 'react-router-dom';

import { buildOperationDetails } from '../../OperateAlertList/utils/buildOperationDetails';
import { useUserActionTracker } from '../../userAction/hooks';

import { useFeedbackRequest } from './useFeedbackRequest';
import { useMapAlerts } from './useMapAlerts';

const MAX_COUNT = 5;
const DELAY_MS = 60000;

/**
 * Feedback 隊列 Hook (整合版)
 *
 * 封裝所有 feedback 相關邏輯：
 * - 操作隊列管理 (累積、計時、觸發)
 * - API 請求處理
 * - Alert 顯示管理
 *
 * @param {string} mapId - 心智圖 ID
 * @param {Function} handleAutoSave - 自動儲存函數
 * @returns {{ addOperation: Function, alerts: Array, setAlerts: Function }}
 */
export const useFeedbackQueue = (mapId, handleAutoSave) => {
    const queueRef = useRef([]);
    const timerRef = useRef(null);
    const [searchParams] = useSearchParams();
    const mapIdFromParams = searchParams.get('mapId');
    const { trackAction } = useUserActionTracker();

    const { alerts, setAlerts, addAlert, updateAlert } = useMapAlerts();
    const { sendFeedback } = useFeedbackRequest(mapId, handleAutoSave);

    const processBatch = useCallback(async (reasoning) => {
        if (queueRef.current.length === 0) return;

        const metadata = [...queueRef.current];
        queueRef.current = [];

        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }

        const operationCount = metadata.length;
        const alertTitle = `完成了 ${operationCount} 個操作`;
        const operationDetails = buildOperationDetails(metadata);

        // 找出最後一個有 newEdges 的 connect 操作（最新的 edges）
        let edgesToSave = null;
        for (let i = metadata.length - 1; i >= 0; i -= 1) {
            if (metadata[i].action === 'connect' && metadata[i].newEdges) {
                edgesToSave = metadata[i].newEdges;
                break;
            }
        }

        const alertId = addAlert({
            message: alertTitle,
            description: 'Generating feedback...',
            status: 'loading',
            showAsk: false,
            operationDetails,
        });

        try {
            // 過濾掉 newEdges（只用於自動儲存，不應存入資料庫）
            const cleanMetadata = metadata.map((op) => {
                const { newEdges, ...cleanOp } = op;
                return cleanOp;
            });

            const result = await sendFeedback(
                cleanMetadata,
                alertTitle,
                operationDetails,
                edgesToSave,
            );
            updateAlert(alertId, {
                description: result.feedback,
                status: 'success',
                showAsk: true,
            });

            // 記錄 AI 主動介入顯示
            trackAction(
                'ai_feedback_shown',
                {
                    operation_count: operationCount,
                    reasoning,
                },
                mapIdFromParams ? parseInt(mapIdFromParams, 10) : null,
                null,
                result?.id || null,
            );
        }
        catch (err) {
            updateAlert(alertId, {
                description: err.data?.error || err.message || '生成回饋失敗',
                status: 'error',
                showAsk: false,
            });
            console.error('Failed to generate feedback:', err);
        }
    }, [addAlert, updateAlert, sendFeedback, mapIdFromParams, trackAction]);

    const addOperation = useCallback(
        (operation) => {
            queueRef.current.push(operation);

            // 條件 1: 數量超過限制，立即發送（累積操作觸發）
            if (queueRef.current.length >= MAX_COUNT) {
                processBatch('accumulated_operations');
                return;
            }

            // 條件 2: 重置計時器（Debounce）（閒置超時觸發）
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            timerRef.current = setTimeout(() => {
                processBatch('idle_timeout');
            }, DELAY_MS);
        },
        [processBatch],
    );

    return { addOperation, alerts, setAlerts };
};
