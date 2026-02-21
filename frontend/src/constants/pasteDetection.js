// --- 閾值 ---
export const PASTE_SCORE_THRESHOLD_MINDMAP = 150;
export const PASTE_SCORE_THRESHOLD_ESSAY = 300;

// --- 加權 ---
const CJK_WEIGHT = 3;
const WORD_WEIGHT = 5;

// --- 警告訊息 ---
const PASTE_WARNING_TITLE = 'Text paste detected.';
const PASTE_WARNING_CONTENT = 'The system has detected text paste. Please ensure that the content is your original work. This action has been logged.';

// --- 自動關閉秒數 ---
const AUTO_CLOSE_SECONDS = 4;

// --- CJK Unicode 範圍正則 ---
const CJK_REGEX = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/g;

/**
 * 加權計算貼上文字的分數
 * - CJK 字元：每個 × 3
 * - 英文單詞：每個 × 5
 * - 100 中文字 ≈ 60 英文詞 ≈ 300 分
 *
 * @param {string} text - 要計算的文字
 * @returns {{ score: number, cjkCount: number, wordCount: number }}
 */
export const calcPasteScore = (text) => {
    if (!text || typeof text !== 'string') return { score: 0, cjkCount: 0, wordCount: 0 };

    const trimmed = text.trim();
    if (trimmed.length === 0) return { score: 0, cjkCount: 0, wordCount: 0 };

    // 計算 CJK 字元數
    const cjkMatches = trimmed.match(CJK_REGEX);
    const cjkCount = cjkMatches ? cjkMatches.length : 0;

    // 移除 CJK 字元後，計算英文單詞數
    const nonCjkText = trimmed.replace(CJK_REGEX, ' ').trim();
    const wordCount = nonCjkText ? nonCjkText.split(/\s+/).filter(Boolean).length : 0;

    const score = (cjkCount * CJK_WEIGHT) + (wordCount * WORD_WEIGHT);
    return { score, cjkCount, wordCount };
};

/**
 * @param {Object} notificationApi - 從 App.useApp() 取得的 notification API
 */
export const showPasteWarning = (notificationApi) => {
    notificationApi.open({
        message: PASTE_WARNING_TITLE,
        description: PASTE_WARNING_CONTENT,
        duration: AUTO_CLOSE_SECONDS,
        placement: 'topRight',
        showProgress: true,
        type: 'info',
        style: { backgroundColor: '#f5f0ff' },
    });
};
