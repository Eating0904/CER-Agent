import { Alert, Button } from 'antd';

import './OperateAlertList.css';

export const OperateAlertList = ({ alerts = [], onAskClick }) => (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {alerts.map((alert) => (
            <Alert
                key={alert.id}
                message={(
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '4px' }}>
                        <span>{alert.message}</span>
                        <Button
                            size="small"
                            type="primary"
                            style={{ marginLeft: '8px' }}
                            onClick={() => onAskClick(alert.message, '試著修改內容吧!')}
                        >
                            Ask
                        </Button>
                    </div>
                )}
                description="試著修改內容吧!"
                type="info"
                style={{ padding: '8px', textAlign: 'left', backgroundColor: '#f3ecfc' }}
            />
        ))}
    </div>
);
