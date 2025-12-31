import { useCallback, useState } from 'react';

/**
 * Feedback 狀態管理 hook
 * 管理 InitiativeFeedback 的顯示狀態
 *
 * @returns {Object} { feedbackData, setFeedbackData, handleCloseFeedback }
 */
export const useFeedback = () => {
    const [feedbackData, setFeedbackData] = useState(null);

    const handleCloseFeedback = useCallback(() => {
        setFeedbackData(null);
    }, []);

    return {
        feedbackData,
        setFeedbackData,
        handleCloseFeedback,
    };
};
