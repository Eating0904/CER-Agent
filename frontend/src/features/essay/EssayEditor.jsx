import { Input } from 'antd';

const { TextArea } = Input;

export const EssayEditor = ({ essayContent, setEssayContent }) => (
    <div
        style={{
            height: '100%',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
        }}
    >
        <TextArea
            value={essayContent}
            onChange={(e) => setEssayContent(e.target.value)}
            placeholder="請輸入文章內容..."
            style={{ flex: 1, resize: 'none' }}
            autoSize={false}
        />
    </div>
);
