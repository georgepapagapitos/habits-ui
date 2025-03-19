import { colorThemes, ColorTheme } from "@theme/colors";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { ThemeProvider as StyledThemeProvider } from "styled-components";
import theme from "@theme";

// Local storage key for storing theme preference
const THEME_STORAGE_KEY = "habits-ui-theme-preference";

interface ThemeContextType {
  currentTheme: ColorTheme;
  setTheme: (theme: ColorTheme) => void;
  availableThemes: ColorTheme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  // Initialize from local storage or default to purple
  const [currentTheme, setCurrentTheme] = useState<ColorTheme>(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    return (savedTheme as ColorTheme) || "purple";
  });

  // Update theme in local storage when changed
  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, currentTheme);
  }, [currentTheme]);

  // Create a merged theme with the selected color palette
  const mergedTheme = {
    ...theme,
    colors: colorThemes[currentTheme],
  };

  const setTheme = (newTheme: ColorTheme) => {
    setCurrentTheme(newTheme);
  };

  const contextValue: ThemeContextType = {
    currentTheme,
    setTheme,
    availableThemes: Object.keys(colorThemes) as ColorTheme[],
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <StyledThemeProvider theme={mergedTheme}>{children}</StyledThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
