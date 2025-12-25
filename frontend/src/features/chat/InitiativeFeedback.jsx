import { Button, Divider } from 'antd';

export const InitiativeFeedback = ({ message, description, onClose }) => {
    if (!message) return null;

    return (
        <div
            style={{
                position: 'absolute',
                bottom: '60px',
                left: '0',
                right: '0',
                zIndex: 10,
                backgroundColor: '#f9f9f9',
                border: '1px solid #d9d9d9',
                borderRadius: '8px',
                padding: '12px',
                margin: '14px',
                boxShadow: '0px 0px 12px #5B00AE',
                textAlign: 'left',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
            }}
        >
            <Button
                danger
                size="small"
                onClick={onClose}
                style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                }}
            >
                Cancel
            </Button>

            <div style={{ fontWeight: 'bold', color: '#5B00AE' }}>
                Initiative Feedback
            </div>
            <Divider style={{ margin: '4px 0' }} />
            <div style={{ fontWeight: 'bold' }}>
                [Operate]
            </div>
            <div style={{ color: '#333', marginBottom: '8px' }}>
                {message}
            </div>
            <div style={{ fontWeight: 'bold' }}>
                [Feedback]
            </div>
            <div style={{ color: '#333', marginBottom: '8px' }}>
                {description}
            </div>
            <div style={{ fontWeight: 'bold' }}>
                [Question]
            </div>
            <div style={{ width: '100%', color: '#666', fontStyle: 'italic' }}>
                Please type in your question about this feedback below.
            </div>
        </div>
    );
};
