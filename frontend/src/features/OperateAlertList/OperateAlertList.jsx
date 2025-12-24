import { Alert, Button } from 'antd';

import './OperateAlertList.css';

export const OperateAlertList = ({ alerts = [] }) => (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {alerts.map((alert) => (
            <Alert
                key={alert.id}
                message={(
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '4px' }}>
                        <span>{alert.message}</span>
                        <Button size="small" type="primary" style={{ marginLeft: '8px' }}>
                            Ask
                        </Button>
                    </div>
                )}
                description="這是第一個提示訊息，用於顯示操作相關的資訊。"
                type="info"
                style={{ padding: '8px', textAlign: 'left', backgroundColor: '#f3ecfc' }}
            />
        ))}
    </div>
);
