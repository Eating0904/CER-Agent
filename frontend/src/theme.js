import { BRAND_COLORS, LAYOUT_COLORS, NEUTRAL_COLORS } from './constants/colors';

export const theme = {
    token: {
        colorPrimary: BRAND_COLORS.primary,
        colorInfo: BRAND_COLORS.info,
        colorLink: BRAND_COLORS.primary,
        colorSuccess: BRAND_COLORS.success,
        colorWarning: BRAND_COLORS.warning,
        colorError: BRAND_COLORS.error,
    },
    components: {
        Layout: {
            headerBg: LAYOUT_COLORS.headerBg,
            siderBg: LAYOUT_COLORS.siderBg,
            triggerBg: LAYOUT_COLORS.siderTriggerBg,
            triggerColor: LAYOUT_COLORS.siderTriggerColor,
        },
        Menu: {
            itemBg: LAYOUT_COLORS.menuItemBg,
            itemColor: LAYOUT_COLORS.menuItemColor,
            itemSelectedBg: BRAND_COLORS.primaryLight,
            itemSelectedColor: NEUTRAL_COLORS.white,
            itemHoverBg: BRAND_COLORS.primaryActive,
            itemHoverColor: NEUTRAL_COLORS.white,
            subMenuItemBg: BRAND_COLORS.primary,
        },
        Button: {
            colorPrimary: BRAND_COLORS.primary,
            colorPrimaryHover: BRAND_COLORS.primaryHover,
            colorPrimaryActive: BRAND_COLORS.primaryActive,
        },
        Input: {
            colorPrimaryHover: BRAND_COLORS.primaryLight,
            colorPrimary: BRAND_COLORS.primary,
        },
        Select: {
            colorPrimary: BRAND_COLORS.primary,
            colorPrimaryHover: BRAND_COLORS.primaryLight,
        },
        Table: {
            colorPrimary: BRAND_COLORS.primary,
            rowSelectedBg: NEUTRAL_COLORS.gray200,
            rowSelectedHoverBg: NEUTRAL_COLORS.gray300,
        },
        Modal: {
            colorPrimary: BRAND_COLORS.primary,
            colorPrimaryHover: BRAND_COLORS.primaryHover,
            colorPrimaryActive: BRAND_COLORS.primaryActive,
        },
        Tabs: {
            colorPrimary: BRAND_COLORS.primary,
        },
        Checkbox: {
            colorPrimary: BRAND_COLORS.primary,
            colorPrimaryHover: BRAND_COLORS.primaryLight,
        },
        Radio: {
            colorPrimary: BRAND_COLORS.primary,
            colorPrimaryHover: BRAND_COLORS.primaryLight,
        },
        Switch: {
            colorPrimary: BRAND_COLORS.primary,
            colorPrimaryHover: BRAND_COLORS.primaryLight,
        },
        Slider: {
            colorPrimaryBorder: BRAND_COLORS.primary,
            colorPrimaryBorderHover: BRAND_COLORS.primaryLight,
        },
        Progress: {
            colorSuccess: BRAND_COLORS.primary,
        },
    },
};
