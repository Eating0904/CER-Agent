import { RobotOutlined } from '@ant-design/icons';
import { Button, InputNumber } from 'antd';

const labelStyle = {
    display: 'block',
    fontSize: '14px',
    marginBottom: '4px',
    color: 'rgba(0, 0, 0, 0.88)',
    textAlign: 'left',
};

export const DimensionControl = ({
    label,
    value,
    onChange,
    onAuto,
    disabled,
}) => (
    <div style={{ marginBottom: '8px' }}>
        <span style={labelStyle}>
            {label}
            <Button
                icon={<RobotOutlined />}
                onClick={onAuto}
                size="small"
                type="text"
                disabled={disabled}
            />
        </span>
        <InputNumber
            value={value}
            placeholder="auto"
            disabled={disabled}
            onChange={onChange}
            style={{ width: '100%' }}
            size="small"
            min={0}
            controls={false}
        />
    </div>
);
