import { useTheme } from "@common/hooks";
import { colorThemes, ColorTheme } from "@theme/colors";
import { Menu } from "@common/components/Menu";
import styled from "styled-components";
import { FaPalette } from "react-icons/fa";

const ColorOptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
`;

const Title = styled.h3`
  margin: 0 0 ${({ theme }) => theme.spacing.xs} 0;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
`;

const ColorOptions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
`;

interface ColorSwatchProps {
  color: string;
  isSelected: boolean;
}

const ColorSwatch = styled.button<ColorSwatchProps>`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid
    ${(props) => (props.isSelected ? props.theme.colors.text : "transparent")};
  background-color: ${(props) => props.color};
  cursor: pointer;
  padding: 0;
  transition:
    transform 0.2s,
    box-shadow 0.2s;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primaryLight};
  }
`;

const ThemeButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 50%;
  background-color: ${({ theme }) => `${theme.colors.primaryLight}33`};
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => `${theme.colors.primaryLight}66`};
  }
`;

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

export default ThemeSelector;
