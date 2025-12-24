import { Alert, Button } from 'antd';

import './OperateAlertList.css';

export const OperateAlertList = () => (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Alert
            message={(
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '4px' }}>
                    <span>使用者新增 Claim1111 </span>
                    <Button size="small" type="primary" style={{ marginLeft: '8px' }}>
                        Ask
                    </Button>
                </div>
            )}
            description="這是第一個提示訊息，用於顯示操作相關的資訊。"
            type="info"
            style={{ padding: '8px', textAlign: 'left', backgroundColor: '#e5d6f8' }}
        />
        <Alert
            message="操作提示 2"
            description="這是第二個提示訊息，用於顯示操作相關的資訊。"
            type="info"
            style={{ padding: '8px', textAlign: 'left', backgroundColor: '#e5d6f8' }}
        />
    </div>
);
