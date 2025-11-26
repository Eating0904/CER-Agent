import { useState } from 'react';

import { Input, Popover } from 'antd';
import { TwitterPicker } from 'react-color';

const labelStyle = {
    display: 'block',
    fontSize: '14px',
    marginBottom: '4px',
    color: 'rgba(0, 0, 0, 0.88)',
    textAlign: 'left',
};

export const ColorControl = ({
    label,
    color,
    onChange,
    onBlur,
    disabled,
}) => {
    const [pickerVisible, setPickerVisible] = useState(false);

    const handlePickerChange = (c) => {
        onChange(c.hex);
    };

    return (
        <div>
            <span style={labelStyle}>{label}</span>
            <Input
                value={color}
                onChange={(e) => onChange(e.target.value)}
                placeholder={label}
                disabled={disabled}
                onBlur={(e) => onBlur && onBlur(e.target.value)}
                size="small"
                suffix={(
                    <Popover
                        content={(
                            <TwitterPicker
                                color={color}
                                onChange={handlePickerChange}
                                triangle="hide"
                            />
                        )}
                        trigger="click"
                        open={pickerVisible && !disabled}
                        onOpenChange={(visible) => !disabled && setPickerVisible(visible)}
                    >
                        <div
                            style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '2px',
                                backgroundColor: color || '#ffffff',
                                border: '1px solid #d9d9d9',
                                cursor: disabled ? 'not-allowed' : 'pointer',
                            }}
                        />
                    </Popover>
                )}
            />
        </div>
    );
};
