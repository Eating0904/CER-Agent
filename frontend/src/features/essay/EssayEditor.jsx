import { useCallback, useRef } from 'react';

import { App } from 'antd';
import { useSearchParams } from 'react-router-dom';

import {
    calcPasteScore,
    PASTE_SCORE_THRESHOLD_ESSAY,
    showPasteWarning,
} from '../../constants/pasteDetection';
import { SimpleEditor } from '../../tiptap-ui/tiptap-templates/simple/simple-editor';
import { useUserActionTracker } from '../userAction/hooks';

export const EssayEditor = ({
    essayContent,
    setEssayContent,
    editorRef,
    disabled = false,
    essayId = null,
}) => {
    const { notification } = App.useApp();
    const [searchParams] = useSearchParams();
    const mapId = searchParams.get('mapId');
    const { trackAction } = useUserActionTracker();
    const startTimeRef = useRef(null);

    const handleFocus = () => {
        startTimeRef.current = Date.now();
        trackAction(
            'essay_edit_start',
            {},
            mapId ? parseInt(mapId, 10) : null,
            essayId ? parseInt(essayId, 10) : null,
        );
    };

    const handleBlur = () => {
        if (startTimeRef.current) {
            const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
            trackAction(
                'essay_edit_end',
                { duration },
                mapId ? parseInt(mapId, 10) : null,
                essayId ? parseInt(essayId, 10) : null,
            );
            startTimeRef.current = null;
        }
    };

    const handlePasteDetected = useCallback((pastedText) => {
        const { score, cjkCount, wordCount } = calcPasteScore(pastedText);
        if (score > PASTE_SCORE_THRESHOLD_ESSAY) {
            showPasteWarning(notification);
            trackAction(
                'paste_detected',
                { paste_score: score, cjk_count: cjkCount, word_count: wordCount, source: 'essay' },
                mapId ? parseInt(mapId, 10) : null,
                essayId ? parseInt(essayId, 10) : null,
            );
        }
    }, [trackAction, mapId, essayId, notification]);

    return (
        <div
            style={{
                height: '100%',
                padding: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                backgroundColor: '#f0f2f5',
            }}
        >
            <div style={{ flex: 1, borderRadius: '6px', overflow: 'hidden', backgroundColor: '#fff' }}>
                <SimpleEditor
                    content={essayContent}
                    onChange={setEssayContent}
                    editorRef={editorRef}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onPasteDetected={handlePasteDetected}
                    editable={!disabled}
                />
            </div>
        </div>
    );
};
