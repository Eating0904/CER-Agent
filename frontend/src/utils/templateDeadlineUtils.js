/**
 * 格式化期限顯示
 * @param {string} startDate - 開始日期 (ISO string)
 * @param {string} endDate - 結束日期 (ISO string)
 * @returns {string} - 格式化的期限字串
 */
export const formatDeadline = (startDate, endDate) => {
    if (!startDate && !endDate) return 'No deadline';

    const formatDate = (dateString) => {
        if (!dateString) return null;
        return new Date(dateString).toLocaleDateString('zh-TW', {
            timeZone: 'Asia/Taipei',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }).replace(/\//g, '-');
    };

    const start = formatDate(startDate) || '—';
    const end = formatDate(endDate) || '—';
    return `${start} ~ ${end}`;
};
