// ============================================================
//  theme.js — Global design tokens for PatGPT Support
//  Green-blue pharma palette, dark & light mode compatible
//  Import this wherever you need raw token values.
//  For Tailwind classes, use the custom classes defined below.
// ============================================================

/**
 * Design system tokens.
 * All CSS variables are declared in index.css.
 * This JS object mirrors them for use in dynamic styles.
 */
export const tokens = {
    // ── Brand ─────────────────────────────────────────────────
    primary: {
        50: "#edfaf5",
        100: "#d1f3e5",
        200: "#a5e7cc",
        300: "#6dd4b0",
        400: "#34bb92",
        500: "#16a37a",   // ← main brand green
        600: "#0f8463",
        700: "#0c6a50",
        800: "#0a5240",
        900: "#083d30",
    },

    teal: {
        50: "#edfbfb",
        100: "#cdf5f6",
        200: "#9debee",
        300: "#60dae0",
        400: "#24c4cc",
        500: "#0ba8b2",   // ← accent teal-blue
        600: "#09889a",
        700: "#0a6d7d",
        800: "#0b5566",
        900: "#0c4454",
    },

    // ── Neutrals ───────────────────────────────────────────────
    surface: {
        light: "#f8fafb",
        DEFAULT: "#ffffff",
        dark: "#0d1117",
    },

    muted: {
        light: "#6b7280",
        dark: "#9ca3af",
    },

    // ── Semantic ───────────────────────────────────────────────
    success: "#16a37a",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#0ba8b2",
};

/**
 * Tailwind CSS arbitrary-value class helpers.
 * These generate the class strings you'd use in JSX.
 *
 * Usage:
 *   import { cls } from '@/themes/theme'
 *   <button className={cls.btnPrimary}>Click</button>
 */
export const cls = {
    // Buttons
    btnPrimary:
        "bg-[#16a37a] hover:bg-[#0f8463] active:bg-[#0c6a50] text-white font-semibold " +
        "rounded-xl px-5 py-2.5 transition-all duration-200 shadow-sm hover:shadow-md " +
        "focus:outline-none focus:ring-2 focus:ring-[#16a37a]/50 disabled:opacity-50 disabled:cursor-not-allowed",

    btnSecondary:
        "bg-[#0ba8b2]/10 hover:bg-[#0ba8b2]/20 text-[#0ba8b2] dark:text-[#24c4cc] font-semibold " +
        "rounded-xl px-5 py-2.5 transition-all duration-200 border border-[#0ba8b2]/30 " +
        "focus:outline-none focus:ring-2 focus:ring-[#0ba8b2]/40 disabled:opacity-50 disabled:cursor-not-allowed",

    btnGhost:
        "hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 " +
        "rounded-xl px-4 py-2 transition-all duration-150 font-medium",

    btnDanger:
        "bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl px-5 py-2.5 " +
        "transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400/50 " +
        "disabled:opacity-50 disabled:cursor-not-allowed",

    // Inputs
    input:
        "w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 " +
        "text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 " +
        "rounded-xl px-4 py-2.5 text-sm transition-all duration-150 " +
        "focus:outline-none focus:ring-2 focus:ring-[#16a37a]/40 focus:border-[#16a37a]",

    // Cards
    card:
        "bg-white dark:bg-[#161b22] border border-gray-100 dark:border-white/[0.06] " +
        "rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200",

    cardGlass:
        "bg-white/70 dark:bg-white/5 backdrop-blur-md border border-white/50 dark:border-white/10 " +
        "rounded-2xl shadow-lg",

    // Layout
    page:
        "min-h-screen bg-[#f8fafb] dark:bg-[#0d1117] text-gray-900 dark:text-gray-100 " +
        "transition-colors duration-300",

    sidebar:
        "h-screen flex flex-col bg-white dark:bg-[#0d1117] border-r border-gray-100 " +
        "dark:border-white/[0.06] transition-colors duration-300",

    // Typography
    heading:
        "font-bold tracking-tight text-gray-900 dark:text-white",

    label:
        "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1",

    muted:
        "text-sm text-gray-500 dark:text-gray-400",

    // Badge / Pills
    badgeGreen:
        "inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full " +
        "bg-[#16a37a]/10 text-[#16a37a] dark:bg-[#16a37a]/20 dark:text-[#6dd4b0]",

    badgeTeal:
        "inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full " +
        "bg-[#0ba8b2]/10 text-[#0ba8b2] dark:bg-[#0ba8b2]/20 dark:text-[#24c4cc]",

    badgeGray:
        "inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full " +
        "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400",

    badgeRed:
        "inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full " +
        "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",

    badgeAmber:
        "inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full " +
        "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",

    // Divider
    divider:
        "border-t border-gray-100 dark:border-white/[0.06]",

    // Nav item
    navItem:
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium " +
        "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white " +
        "hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-150 cursor-pointer",

    navItemActive:
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold " +
        "text-[#16a37a] dark:text-[#6dd4b0] bg-[#16a37a]/8 dark:bg-[#16a37a]/15 " +
        "transition-all duration-150 cursor-pointer",

    // Alert / Callout
    alertSuccess:
        "flex items-start gap-3 p-4 rounded-xl bg-[#16a37a]/10 border border-[#16a37a]/20 " +
        "text-[#0c6a50] dark:text-[#6dd4b0]",

    alertError:
        "flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 " +
        "text-red-700 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400",

    alertInfo:
        "flex items-start gap-3 p-4 rounded-xl bg-[#0ba8b2]/10 border border-[#0ba8b2]/20 " +
        "text-[#09889a] dark:text-[#24c4cc]",

    // Spinner
    spinner:
        "animate-spin rounded-full border-2 border-gray-200 border-t-[#16a37a]",
};

/**
 * Status → badge class mapper helpers.
 */
export const ticketStatusCls = {
    raised: cls.badgeAmber,
    pending: cls.badgeTeal,
    attended: cls.badgeGreen,
    closed: cls.badgeGray,
};

export const ticketTypeCls = {
    bug: cls.badgeRed,
    question: cls.badgeTeal,
    feature: cls.badgeGreen,
    other: cls.badgeGray,
};

export const roleCls = {
    admin: cls.badgeTeal,
    user: cls.badgeGreen,
};

export default { tokens, cls, ticketStatusCls, ticketTypeCls, roleCls };