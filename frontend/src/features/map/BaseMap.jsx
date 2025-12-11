import {
    Background,
    ConnectionMode,
    Controls,
    ReactFlow,
} from '@xyflow/react';

import { NEUTRAL_COLORS } from '../../constants/colors';

import { BaseNode } from './components/nodes';
import { useMapContext } from './hooks';

const nodeTypes = {
    baseNode: BaseNode,
};

export const BaseMap = () => {
    const {
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        selectNode,
    } = useMapContext();

    return (
        <div style={{ height: '100%', width: '100%', backgroundColor: NEUTRAL_COLORS.white }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                fitView
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={(e, n) => selectNode(n.id)}
                onEdgeClick={() => selectNode(null)}
                onPaneClick={() => selectNode(null)}
                connectionMode={ConnectionMode.Loose}
                proOptions={{ hideAttribution: true }}
            >
                <Background />
                <Controls />
            </ReactFlow>
        </div>
    );
};
