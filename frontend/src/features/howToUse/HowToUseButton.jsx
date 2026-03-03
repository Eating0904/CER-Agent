import { Button } from 'antd';

export const HowToUseButton = ({ style }) => (
    <Button
        type="text"
        href="/how-to-use"
        target="_blank"
        rel="noopener noreferrer"
        style={{ flexShrink: 0, ...style }}
    >
        How to Use?
    </Button>
);
