import { Avatar } from 'antd';

export const StepBadge = ({ number }) => (
    <Avatar
        size={24}
        style={{
            backgroundColor: '#f5c4a8',
            color: '#1a2f5a',
            fontSize: '14px',
            flexShrink: 0,
            margin: '0px 4px',
            fontWeight: 'bold',
        }}
    >
        {number}
    </Avatar>
);
