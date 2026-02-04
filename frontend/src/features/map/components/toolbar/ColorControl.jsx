import { ColorPicker, Flex, Input } from 'antd';

import { DEFAULT_COLORS, NEUTRAL_COLORS } from '../../../../constants/colors';

export const ColorControl = ({
    label,
    icon,
    color,
    onChange,
    onBlur,
    disabled,
    placeholder,
}) => {
    const handlePickerChange = (value) => {
        const hexColor = value.toHexString();
        onChange(hexColor);
    };

    const handleOpenChange = (open) => {
        if (!open && onBlur) {
            onBlur(color);
        }
    };

    return (
        <Flex gap="4px">
            {icon || label}
            <Input
                value={color}
                placeholder={placeholder}
                disabled={disabled}
                size="small"
                suffix={(
                    <ColorPicker
                        value={color || NEUTRAL_COLORS.white}
                        onChange={handlePickerChange}
                        onOpenChange={handleOpenChange}
                        disabled={disabled}
                        size="small"
                    >
                        <div
                            style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '2px',
                                backgroundColor: color || NEUTRAL_COLORS.white,
                                border: `1px solid ${DEFAULT_COLORS.inputBorder}`,
                                cursor: disabled ? 'not-allowed' : 'pointer',
                            }}
                        />
                    </ColorPicker>
                )}
            />
        </Flex>
    );
};
