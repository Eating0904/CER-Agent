import { useEffect, useRef, useState } from 'react';

import { Input } from 'antd';

import { useMapContext } from './useMapContext';

const { TextArea } = Input;

export const ExpandableInput = () => {
    const [isFocused, setIsFocused] = useState(false);
    const [localContent, setLocalContent] = useState('');
    const containerRef = useRef(null);

    const { selectedNode, updateNodeContent } = useMapContext();

    useEffect(() => {
        if (selectedNode) {
            setLocalContent(selectedNode.data.content || '');
        }
        else {
            setLocalContent('');
        }
    }, [selectedNode]);

    const handleChange = (e) => {
        const newContent = e.target.value;
        setLocalContent(newContent);
        if (selectedNode) {
            updateNodeContent(selectedNode.id, newContent);
        }
    };

    return (
        <div
            ref={containerRef}
            style={{
                position: 'relative',
                padding: '8px',
            }}
        >
            <TextArea
                value={localContent}
                onChange={handleChange}
                placeholder={selectedNode ? 'Edit node content...' : 'Select a node to edit...'}
                disabled={!selectedNode}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                style={{
                    position: isFocused ? 'fixed' : 'relative',
                    left: isFocused && containerRef.current
                        ? `${containerRef.current.getBoundingClientRect().left + 8}px`
                        : 'auto',
                    width: isFocused && containerRef.current
                        ? `${containerRef.current.getBoundingClientRect().width - 16}px`
                        : '100%',
                    height: isFocused ? '200px' : '104px',
                    resize: 'none',
                    backgroundColor: 'white',
                    boxShadow: isFocused ? '0 4px 12px rgba(0, 0, 0, 0.15)' : 'none',
                    zIndex: isFocused ? 1000 : 1,
                }}
            />
        </div>
    );
};
