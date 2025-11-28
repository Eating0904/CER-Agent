import { useState } from 'react';

import { Flex, Input, Popover } from 'antd';
import { TwitterPicker } from 'react-color';

export const ColorControl = ({
    label,
    icon,
    color,
    onChange,
    onBlur,
    disabled,
    placeholder,
}) => {
    const [pickerVisible, setPickerVisible] = useState(false);

    const handlePickerChange = (c) => {
        onChange(c.hex);
    };

    return (
        <Flex gap="4px">
            {icon || label}
            <Input
                value={color}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
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
        </Flex>
    );
};
