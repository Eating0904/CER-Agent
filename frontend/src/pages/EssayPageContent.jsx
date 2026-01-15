import { Input } from 'antd';

const { TextArea } = Input;

/**
 * EssayPageContent 組件
 * 負責 Essay 頁面的主要 UI 渲染，包含文章編輯區域
 */
export const EssayPageContent = () => (
    <div style={{ height: '100%', padding: '16px' }}>
        <TextArea
            placeholder="請輸入文章內容..."
            style={{ height: '100%', resize: 'none' }}
            autoSize={{ minRows: 10 }}
        />
    </div>
);
