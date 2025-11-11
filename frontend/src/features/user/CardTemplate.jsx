import { Card } from 'antd';

export const CardTemplate = ({ children }) => (
    <div
        style={{
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        }}
    >
        <Card
            style={{
                width: 400,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                textAlign: 'left',
            }}
        >
            {children}
        </Card>
    </div>
);
