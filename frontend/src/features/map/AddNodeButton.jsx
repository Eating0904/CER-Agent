import { useState } from 'react';

import { Button } from 'antd';

import { useMapContext } from './useMapContext';

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
                    color: 'black',
                    backgroundColor: isClaimHovered ? '#86e4ba' : '#49db88ff',
                    transition: 'background-color 0.2s ease',
                    borderColor: '#49db88ff',
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
                    color: 'black',
                    backgroundColor: isEvidenceHovered ? '#f7c775ff' : '#f7be5dff',
                    transition: 'background-color 0.2s ease',
                    borderColor: '#f7be5dff',
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
                    color: 'black',
                    backgroundColor: isReasoningHovered ? '#a3cfeeff' : '#7cbeecff',
                    transition: 'background-color 0.2s ease',
                    borderColor: '#7cbeecff',
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
