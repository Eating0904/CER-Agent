/**
 * 組成操作描述文字
 *
 * @param {Array} metadata - 操作列表
 * @returns {string} 格式化的操作描述
 */
export const buildOperationDetails = (metadata) => {
    if (!metadata || metadata.length === 0) {
        return 'Student operation detected.';
    }

    const descriptionLines = ['Student operation detected:'];
    metadata.forEach((op, idx) => {
        const { action } = op;
        if (action === 'edit') {
            const nodeId = op.node_id || '';
            descriptionLines.push(`${idx + 1}. edited node ${nodeId}`);
        }
        else if (action === 'connect') {
            const nodes = op.connected_nodes || [];
            if (nodes.length >= 2) {
                descriptionLines.push(`${idx + 1}. connected ${nodes[0]} and ${nodes[1]}`);
            }
        }
        else if (action === 'delete_node') {
            const nodeId = op.node_id || '';
            const deletedConnections = op.deleted_connections || [];

            if (deletedConnections.length > 0) {
                // 提取所有連接的節點 ID
                const nodesList = deletedConnections.map((conn) => conn.node_id).join(', ');
                descriptionLines.push(`${idx + 1}. deleted node ${nodeId} along with its connections to nodes: ${nodesList}`);
            }
            else {
                descriptionLines.push(`${idx + 1}. deleted node ${nodeId}`);
            }
        }
        else if (action === 'delete_edge') {
            const nodes = op.connected_nodes || [];
            if (nodes.length >= 2) {
                descriptionLines.push(`${idx + 1}. deleted connection between ${nodes[0]} and ${nodes[1]}`);
            }
        }
    });

    return descriptionLines.join('\n');
};
