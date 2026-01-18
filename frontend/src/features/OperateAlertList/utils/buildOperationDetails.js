/**
 * 組成操作描述文字
 *
 * @param {Array} metadata - 操作列表
 * @returns {string} 格式化的操作描述
 */
export const buildOperationDetails = (metadata) => {
    if (!metadata || metadata.length === 0) {
        return '學生進行了操作';
    }

    const descriptionLines = ['學生進行了以下操作：'];
    metadata.forEach((op, idx) => {
        const { action } = op;
        if (action === 'edit') {
            const nodeId = op.node_id || '';
            descriptionLines.push(`${idx + 1}. 編輯了節點 ${nodeId}`);
        }
        else if (action === 'connect') {
            const nodes = op.connected_nodes || [];
            if (nodes.length >= 2) {
                descriptionLines.push(`${idx + 1}. 連接了 ${nodes[0]} 和 ${nodes[1]}`);
            }
        }
    });

    return descriptionLines.join('\n');
};
