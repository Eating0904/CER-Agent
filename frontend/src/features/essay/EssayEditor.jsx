import { useRef } from 'react';

import { useSearchParams } from 'react-router-dom';

import { SimpleEditor } from '../../tiptap-ui/tiptap-templates/simple/simple-editor';
import { useUserActionTracker } from '../userAction/hooks';

export const EssayEditor = ({ essayContent, setEssayContent, editorRef }) => {
    const [searchParams] = useSearchParams();
    const mapId = searchParams.get('mapId');
    const { trackAction } = useUserActionTracker();
    const startTimeRef = useRef(null);

    const handleFocus = () => {
        startTimeRef.current = Date.now();
        trackAction('essay_edit_start', {}, mapId ? parseInt(mapId, 10) : null);
    };

    const handleBlur = () => {
        if (startTimeRef.current) {
            const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
            trackAction('essay_edit_end', { duration }, mapId ? parseInt(mapId, 10) : null);
            startTimeRef.current = null;
        }
    };

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
                />
            </div>
        </div>
    );
};
