import { useState } from 'react';

import { Button } from 'antd';

import { NEUTRAL_COLORS, NODE_COLORS } from '../../../../constants/colors';
import { useMapContext } from '../../hooks';

export const AddNodeButton = () => {
    const { addNode } = useMapContext();
    const [isClaimHovered, setIsClaimHovered] = useState(false);
    const [isEvidenceHovered, setIsEvidenceHovered] = useState(false);
    const [isReasoningHovered, setIsReasoningHovered] = useState(false);

    return (
        <div
            style={{
                padding: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                alignItems: 'flex-start',
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
                onClick={() => addNode('C')}
                onMouseEnter={() => setIsClaimHovered(true)}
                onMouseLeave={() => setIsClaimHovered(false)}
            >
                + Add Claim
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
                onClick={() => addNode('E')}
                onMouseEnter={() => setIsEvidenceHovered(true)}
                onMouseLeave={() => setIsEvidenceHovered(false)}
            >
                + Add Evidence
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
                onClick={() => addNode('R')}
                onMouseEnter={() => setIsReasoningHovered(true)}
                onMouseLeave={() => setIsReasoningHovered(false)}
            >
                + Add Reasoning
            </Button>
        </div>
    );
};
