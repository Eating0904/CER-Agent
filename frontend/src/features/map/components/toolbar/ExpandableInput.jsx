import { useEffect, useRef, useState } from 'react';

import { Input } from 'antd';
import { useSearchParams } from 'react-router-dom';

import { NEUTRAL_COLORS, SHADOW_COLORS } from '../../../../constants/colors';
import { useUserActionTracker } from '../../../userAction/hooks';
import { useMapContext } from '../../hooks';

const { TextArea } = Input;

export const ExpandableInput = () => {
    const [isFocused, setIsFocused] = useState(false);
    const [localContent, setLocalContent] = useState('');
    const containerRef = useRef(null);
    const startTimeRef = useRef(null);

    const [searchParams] = useSearchParams();
    const mapId = searchParams.get('mapId');
    const { trackAction } = useUserActionTracker();
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

    const handleFocus = () => {
        setIsFocused(true);
        if (selectedNode) {
            startTimeRef.current = Date.now();
            trackAction('node_edit_start', { node_id: selectedNode.id }, mapId ? parseInt(mapId, 10) : null);
        }
    };

    const handleBlur = () => {
        setIsFocused(false);
        if (selectedNode && startTimeRef.current) {
            const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
            trackAction('node_edit_end', { node_id: selectedNode.id, duration }, mapId ? parseInt(mapId, 10) : null);
            startTimeRef.current = null;
        }
    };

    return (
        <div
            ref={containerRef}
            style={{
                position: 'relative',
                padding: '8px',
                height: '100%',
            }}
        >
            <TextArea
                value={localContent}
                onChange={handleChange}
                placeholder={selectedNode ? 'Edit node content...' : 'Select a node to edit...'}
                disabled={!selectedNode}
                onFocus={handleFocus}
                onBlur={handleBlur}
                style={{
                    position: isFocused ? 'fixed' : 'relative',
                    left: isFocused && containerRef.current
                        ? `${containerRef.current.getBoundingClientRect().left + 8}px`
                        : 'auto',
                    width: isFocused && containerRef.current
                        ? `${containerRef.current.getBoundingClientRect().width - 16}px`
                        : '100%',
                    height: isFocused ? '200px' : '100%',
                    resize: 'none',
                    backgroundColor: NEUTRAL_COLORS.white,
                    boxShadow: isFocused ? SHADOW_COLORS.inputFocusShadow : 'none',
                    zIndex: isFocused ? 1000 : 1,
                }}
            />
        </div>
    );
};
