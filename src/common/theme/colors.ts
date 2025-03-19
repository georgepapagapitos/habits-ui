// Color palette generator functions
const generateColorPalette = (
  primaryColor: string,
  primaryLight: string,
  primaryDark: string,
  primaryText: string
) => {
  return {
    // Primary colors
    primary: primaryColor,
    primaryLight: primaryLight,
    primaryDark: primaryDark,
    primaryText: primaryText,
    primaryHover: primaryDark,
    primaryFocus: primaryLight,
    primaryActive: primaryDark,

    // Secondary colors
    secondary: "#a896a6", // For secondary buttons
    secondaryLight: "#c4b7c2", // Lighter version
    secondaryDark: "#8f7e8c", // Darker version for hover
    secondaryHover: "#b1a0ae",
    secondaryActive: "#8f7e8c",

    // Accent colors
    accent1: "#7986cb", // Soft indigo
    accent2: "#4db6ac", // Teal
    accent3: "#ffb74d", // Amber

    // Background colors - adjusted to match the primary color
    background: `${primaryLight}33`, // Very light version of primary with low opacity
    backgroundAlt: `${primaryLight}44`,
    backgroundHover: `${primaryLight}55`,
    backgroundActive: `${primaryLight}66`,
    surface: "#ffffff",
    surfaceHover: `${primaryLight}11`,
    surfaceActive: `${primaryLight}22`,

    // Text colors
    text: "#333333",
    textLight: "#666666",
    textMuted: "#999999",
    textOnPrimary: "#ffffff",
    textOnDark: "#ffffff",

    // UI colors
    success: "#4caf50", // Success states
    successLight: "#a5d6a7", // Light success background
    successDark: "#3d8b40", // Dark/hover success
    error: "#f44336", // Error states
    errorLight: "#ffcdd2", // Light error background
    errorDark: "#c0392b", // Dark/hover error
    warning: "#ff9800", // Warning states
    warningLight: "#ffe0b2", // Light warning background
    warningDark: "#e68900", // Dark/hover warning
    info: "#2196f3", // Info states
    infoLight: "#bbdefb", // Light info background
    infoDark: "#0c7cd5", // Dark/hover info

    // State colors
    disabled: "#cccccc", // Disabled state
    disabledBackground: "#f5f5f5", // Background for disabled elements
    disabledText: "#888888", // Text on disabled elements
    focus: primaryLight,
    active: primaryColor,
    hover: "rgba(0, 0, 0, 0.05)",
    pressed: "rgba(0, 0, 0, 0.1)",

    // Others
    border: "#dddddd",
    borderLight: "#eeeeee",
    borderDark: "#cccccc",
    borderFocus: primaryLight,
    shadow: "rgba(0, 0, 0, 0.1)",
    shadowDark: "rgba(0, 0, 0, 0.2)",
    overlay: "rgba(0, 0, 0, 0.5)",
    overlayLight: "rgba(0, 0, 0, 0.3)",
    overlayDark: "rgba(0, 0, 0, 0.7)",
    divider: "#e5e5e5",

    // Functional transparent colors
    transparent: {
      light: "rgba(0, 0, 0, 0.05)",
      medium: "rgba(0, 0, 0, 0.1)",
      heavy: "rgba(0, 0, 0, 0.2)",
      primary10: `${primaryColor}1a`, // Primary with 10% opacity
      primary20: `${primaryColor}33`, // Primary with 20% opacity
      white10: "rgba(255, 255, 255, 0.1)",
      white20: "rgba(255, 255, 255, 0.2)",
    },
  };
};

// Define color themes
export const colorThemes = {
  purple: generateColorPalette("#a15fcd", "#bb94d5", "#653b81", "#480733"),
  blue: generateColorPalette("#3f51b5", "#7986cb", "#303f9f", "#1a237e"),
  green: generateColorPalette("#4caf50", "#81c784", "#388e3c", "#1b5e20"),
  red: generateColorPalette("#f44336", "#e57373", "#d32f2f", "#b71c1c"),
  teal: generateColorPalette("#009688", "#4db6ac", "#00796b", "#004d40"),
  orange: generateColorPalette("#ff9800", "#ffb74d", "#f57c00", "#e65100"),
};

// Default to purple theme
export const colors = colorThemes.purple;

// Export all for theme context
export type ColorTheme = keyof typeof colorThemes;
