import { useState } from 'react';

import { Button } from 'antd';
import { useSearchParams } from 'react-router-dom';

import { NEUTRAL_COLORS, NODE_COLORS } from '../../../../constants/colors';
import { useUserActionTracker } from '../../../userAction/hooks';
import { useMapContext } from '../../hooks';

export const AddNodeButton = () => {
    const { addNode } = useMapContext();
    const [searchParams] = useSearchParams();
    const mapId = searchParams.get('mapId');
    const { trackAction } = useUserActionTracker();
    const [isClaimHovered, setIsClaimHovered] = useState(false);
    const [isEvidenceHovered, setIsEvidenceHovered] = useState(false);
    const [isReasoningHovered, setIsReasoningHovered] = useState(false);

    const handleAddNode = (nodeType, nodeTypeString) => {
        const newNodeId = addNode(nodeType);

        // 記錄新增節點行為
        trackAction('add_node', {
            node_id: newNodeId,
            node_type: nodeTypeString,
        }, mapId ? parseInt(mapId, 10) : null);
    };

    return (
        <div
            style={{
                padding: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                alignItems: 'flex-start',
                height: '100%',
            }}
        >
            <Button
                style={{
                    width: '100%',
                    color: NEUTRAL_COLORS.black,
                    backgroundColor: isClaimHovered
                        ? NODE_COLORS.claimHover
                        : NODE_COLORS.claim,
                    transition: 'background-color 0.2s ease',
                    borderColor: NODE_COLORS.claim,
                }}
                onClick={() => handleAddNode('C', 'claim')}
                onMouseEnter={() => setIsClaimHovered(true)}
                onMouseLeave={() => setIsClaimHovered(false)}
            >
                + Claim
            </Button>
            <Button
                style={{
                    width: '100%',
                    color: NEUTRAL_COLORS.black,
                    backgroundColor: isEvidenceHovered
                        ? NODE_COLORS.evidenceHover
                        : NODE_COLORS.evidence,
                    transition: 'background-color 0.2s ease',
                    borderColor: NODE_COLORS.evidence,
                }}
                onClick={() => handleAddNode('E', 'evidence')}
                onMouseEnter={() => setIsEvidenceHovered(true)}
                onMouseLeave={() => setIsEvidenceHovered(false)}
            >
                + Evidence
            </Button>
            <Button
                style={{
                    width: '100%',
                    color: NEUTRAL_COLORS.black,
                    backgroundColor: isReasoningHovered
                        ? NODE_COLORS.reasoningHover
                        : NODE_COLORS.reasoning,
                    transition: 'background-color 0.2s ease',
                    borderColor: NODE_COLORS.reasoning,
                }}
                onClick={() => handleAddNode('R', 'reasoning')}
                onMouseEnter={() => setIsReasoningHovered(true)}
                onMouseLeave={() => setIsReasoningHovered(false)}
            >
                + Reasoning
            </Button>
        </div>
    );
};
