import { Card } from 'antd';

import { HowToUseButton } from '../howToUse';

export const CardTemplate = ({ children }) => (
    <div
        style={{
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
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
        <HowToUseButton style={{ marginTop: '12px' }} />
    </div>
);
