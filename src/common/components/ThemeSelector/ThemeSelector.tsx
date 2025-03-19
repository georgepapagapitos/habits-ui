import { useTheme } from "@common/hooks";
import { colorThemes, ColorTheme } from "@theme/colors";
import { Menu } from "@common/components/Menu";
import { FaPalette } from "react-icons/fa";
import {
  ColorOptionsContainer,
  Title,
  ColorOptions,
  ColorSwatch,
  ThemeButtonWrapper,
} from "./themeSelector.styles";

export const ThemeSelector = () => {
  const { currentTheme, setTheme, availableThemes } = useTheme();

  const handleThemeChange = (newTheme: ColorTheme) => {
    setTheme(newTheme);
  };

  const ThemeSelectorContent = () => (
    <ColorOptionsContainer>
      <Title>Theme Color</Title>
      <ColorOptions>
        {availableThemes.map((themeName) => (
          <ColorSwatch
            key={themeName}
            color={colorThemes[themeName].primary}
            isSelected={currentTheme === themeName}
            onClick={() => handleThemeChange(themeName)}
            data-theme={themeName}
            aria-label={`${themeName} theme`}
            title={`${themeName.charAt(0).toUpperCase() + themeName.slice(1)} theme`}
          />
        ))}
      </ColorOptions>
    </ColorOptionsContainer>
  );

  const trigger = (
    <ThemeButtonWrapper>
      <FaPalette size={18} />
    </ThemeButtonWrapper>
  );

  return (
    <Menu trigger={trigger} placement="bottom-end">
      <ThemeSelectorContent />
    </Menu>
  );
};
