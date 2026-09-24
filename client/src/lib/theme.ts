import type { ThemeConfig } from "antd";

export const BRAND = {
  primary: "#14B8A6",
  primaryHover: "#0F9A8B",
  primaryActive: "#0D8578",
  bg: "#FAFAF7",
  surface: "#FFFFFF",
  border: "#E2E8F0",
  text: "#0F172A",
  textSecondary: "#64748B",
  success: "#10B981",
  warning: "#F59E0B",
  info: "#0EA5E9",
  danger: "#F43F5E",
} as const;

export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: BRAND.primary,
    colorSuccess: BRAND.success,
    colorWarning: BRAND.warning,
    colorInfo: BRAND.info,
    colorError: BRAND.danger,

    colorText: BRAND.text,
    colorTextSecondary: BRAND.textSecondary,
    colorBgBase: BRAND.bg,
    colorBgContainer: BRAND.surface,
    colorBorder: BRAND.border,
    colorBorderSecondary: BRAND.border,

    borderRadius: 8,
    borderRadiusLG: 10,
    borderRadiusSM: 6,

    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: 14,

    controlHeight: 38,
    controlHeightLG: 44,
    controlHeightSM: 30,

    boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.06)",
  },
  components: {
    Layout: {
      headerBg: BRAND.surface,
      headerHeight: 64,
      siderBg: BRAND.surface,
      bodyBg: BRAND.bg,
    },
    Menu: {
      itemSelectedBg: "#E6F7F5",
      itemSelectedColor: BRAND.primaryActive,
      itemHoverBg: "#F1F5F9",
      itemHeight: 40,
    },
    Table: {
      headerBg: "#F8FAFC",
      headerColor: BRAND.textSecondary,
      rowHoverBg: "#F8FAFC",
      borderColor: BRAND.border,
    },
    Button: {
      primaryShadow: "none",
    },
  },
};
