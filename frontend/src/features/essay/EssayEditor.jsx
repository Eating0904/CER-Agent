import { SimpleEditor } from '../../tiptap-ui/tiptap-templates/simple/simple-editor';

export const EssayEditor = ({ essayContent, setEssayContent }) => (
    <div
        style={{
            height: '100%',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            backgroundColor: '#f0f2f5',
        }}
    >
        <div style={{ flex: 1, border: '1px solid #d9d9d9', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#fff' }}>
            <SimpleEditor
                content={essayContent}
                onChange={setEssayContent}
            />
        </div>
    </div>
);
