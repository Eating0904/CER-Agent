/**
 * 統一的顏色管理系統
 * 所有顏色定義集中在此檔案，方便統一修改和維護
 */

// ===== 品牌主色系 =====
export const BRAND_COLORS = {
    // 主要品牌紫色
    primary: '#5B00AE',
    primaryHover: '#8600FF',
    primaryActive: '#2a0052',
    primaryLight: '#5a00a0',
    primaryDark: '#28004D',
    primaryVeryLight: '#FAF4FF',

    // 輔助顏色
    success: '#52c41a',
    warning: '#faad14',
    error: '#ff4d4f',
    info: '#5B00AE',
};

// ===== CER 模型節點顏色 =====
export const NODE_COLORS = {
    // C - Claim（主張）
    claim: '#49db88ff',
    claimHover: '#86e4ba',

    // E - Evidence（證據）
    evidence: '#f7be5dff',
    evidenceHover: '#f7c775ff',

    // R - Reasoning（推理）
    reasoning: '#7cbeecff',
    reasoningHover: '#a3cfeeff',

    // 預設節點
    default: '#FFFFFF',
    defaultBorder: '#808080',
};

// ===== 中性色系 =====
export const NEUTRAL_COLORS = {
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',

    // 灰階
    gray100: '#f5f5f5', // 工具欄背景
    gray200: '#f0e6ff', // 表格選中行背景（淡紫色）
    gray300: '#e6d9ff', // 表格選中行懸停背景
    gray400: '#d9d9d9', // 淡灰色邊框
    gray500: '#808080', // 灰色邊框
    gray600: '#343330', // 深灰色（圖標實心）
};

// ===== 透明色/陰影 =====
export const SHADOW_COLORS = {
    shadowLight: 'rgba(0, 0, 0, 0.15)',
    shadowMedium: 'rgba(0, 0, 0, 0.65)',
    hoverOverlay: 'rgba(255, 255, 255, 0.18)',
    selectedHighlight: '0 0 8px #8600FF',
    cardShadow: '0 2px 8px rgba(0,0,0,0.15)',
    inputFocusShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
};

// ===== 漸變色 =====
export const GRADIENT_COLORS = {
    // 字體顏色圖標漸變
    fontColorGradient: {
        start: '#8277FF',
        middle: '#83FFC3',
        end: '#FF7676',
    },

    // 背景顏色圖標漸變
    backgroundColorGradient: {
        start: '#FF7676',
        middle: '#83FFC3',
        end: '#8277FF',
    },

    // 邊框顏色圖標漸變（錐形漸變）
    borderColorGradient: {
        color1: '#FF7676', // 64.8°
        color2: '#83FFC3', // 187.2°
        color3: '#8277FF', // 352.8°
    },
};

// ===== 佈局顏色 =====
export const LAYOUT_COLORS = {
    // Header
    headerBg: BRAND_COLORS.primary,
    headerText: NEUTRAL_COLORS.white,

    // Sider
    siderBg: BRAND_COLORS.primaryDark,
    siderTriggerBg: BRAND_COLORS.primaryActive,
    siderTriggerColor: NEUTRAL_COLORS.white,

    // Content
    contentBg: NEUTRAL_COLORS.white,

    // Menu
    menuItemBg: BRAND_COLORS.primary,
    menuItemColor: NEUTRAL_COLORS.white,
    menuItemSelectedBg: BRAND_COLORS.primaryVeryLight,
    menuItemSelectedColor: NEUTRAL_COLORS.black,
    menuItemHoverBg: BRAND_COLORS.primaryLight,
    menuItemHoverColor: NEUTRAL_COLORS.white,
    menuItemHoverBgTransparent: SHADOW_COLORS.hoverOverlay,
};

// ===== 預設值 =====
export const DEFAULT_COLORS = {
    fontColor: NEUTRAL_COLORS.black,
    backgroundColor: NEUTRAL_COLORS.white,
    borderColor: NEUTRAL_COLORS.gray500,
    inputBorder: NEUTRAL_COLORS.gray400,
};

// ===== 輔助函數 =====

/**
 * 根據節點類型獲取對應顏色
 * @param {string} type - 節點類型 ('C', 'E', 'R')
 * @param {boolean} isHover - 是否為懸停狀態
 * @returns {string} 顏色值
 */
export const getNodeColorByType = (type, isHover = false) => {
    const typeMap = {
        C: isHover ? NODE_COLORS.claimHover : NODE_COLORS.claim,
        E: isHover ? NODE_COLORS.evidenceHover : NODE_COLORS.evidence,
        R: isHover ? NODE_COLORS.reasoningHover : NODE_COLORS.reasoning,
    };
    return typeMap[type] || NODE_COLORS.default;
};

/**
 * 生成線性漸變 CSS 字串
 * @param {Object} gradient - 漸變對象 {start, middle, end}
 * @param {string} direction - 漸變方向，預設 'to right'
 * @returns {string} CSS 漸變字串
 */
export const createLinearGradient = (gradient, direction = 'to right') => `linear-gradient(${direction}, ${gradient.start}, ${gradient.middle}, ${gradient.end})`;

/**
 * 生成錐形漸變 CSS 字串
 * @param {Object} gradient - 漸變對象 {color1, color2, color3}
 * @returns {string} CSS 漸變字串
 */
export const createConicGradient = (gradient) => `conic-gradient(from 0deg, ${gradient.color1} 64.8deg, ${gradient.color2} 187.2deg, ${gradient.color3} 352.8deg)`;
