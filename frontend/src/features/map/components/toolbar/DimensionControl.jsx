import { RobotOutlined } from '@ant-design/icons';
import { Button, Flex, InputNumber } from 'antd';

export const DimensionControl = ({
    label,
    value,
    onChange,
    onAuto,
    disabled,
    showAutoButton = true,
    placeholder,
}) => (
    <Flex gap="4px" style={{ alignItems: 'center' }}>
        {label && (
            <span
                style={{
                    width: '14px',
                    flexShrink: 0,
                    textAlign: 'right',
                    display: 'inline-block',
                    marginRight: '4px',
                }}
            >
                {label}
            </span>
        )}
        <InputNumber
            value={value}
            placeholder={placeholder}
            disabled={disabled}
            onChange={onChange}
            style={{ width: '100%' }}
            size="small"
            min={0}
            controls={false}
        />
        {showAutoButton && (
            <Button
                icon={<RobotOutlined />}
                onClick={onAuto}
                size="small"
                type="text"
                disabled={disabled}
            />
        )}
    </Flex>
);
