import { InfoCircleOutlined } from '@ant-design/icons';
import {
    Alert, Button, Spin, Tooltip,
} from 'antd';

import './OperateAlertList.css';

export const OperateAlertList = ({ alerts = [], onAskClick }) => (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {alerts.map((alert) => {
            // 根據狀態決定顯示內容
            const isLoading = alert.status === 'loading';
            const isError = alert.status === 'error';
            const isSuccess = alert.status === 'success';

            return (
                <Alert
                    key={alert.id}
                    message={(
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '4px' }}>
                            <span>
                                {alert.operationDetails && (
                                    <Tooltip title={<pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{alert.operationDetails}</pre>}>
                                        <InfoCircleOutlined style={{ marginRight: '8px', color: '#5B00AE', cursor: 'pointer' }} />
                                    </Tooltip>
                                )}
                                {alert.message}
                            </span>
                            {isSuccess && alert.showAsk && (
                                <Button
                                    size="small"
                                    type="primary"
                                    style={{ marginLeft: '8px' }}
                                    onClick={() => onAskClick(alert.operationDetails
                                        || alert.message, alert.description)}
                                >
                                    Ask
                                </Button>
                            )}
                        </div>
                    )}
                    description={
                        isLoading ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Spin size="small" />
                                <span>正在生成回饋...</span>
                            </div>
                        ) : (
                            alert.description
                        )
                    }
                    type={isError ? 'error' : 'info'}
                    style={{ padding: '8px', textAlign: 'left', backgroundColor: isError ? '#fff2f0' : '#f3ecfc' }}
                />
            );
        })}
    </div>
);
