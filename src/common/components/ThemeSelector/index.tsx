import { useTheme } from "@common/hooks";
import { colorThemes, ColorTheme } from "@theme/colors";
import { MouseEvent } from "react";
import styled from "styled-components";

const ThemeSelectorContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Title = styled.h3`
  margin: 0;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
`;

const ColorOptions = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

interface ColorOptionProps {
  color: string;
  isSelected: boolean;
}

const ColorOption = styled.button<ColorOptionProps>`
  width: 32px;
  height: 32px;
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

export const ThemeSelector = () => {
  const { currentTheme, setTheme, availableThemes } = useTheme();

  const handleThemeChange = (e: MouseEvent<HTMLButtonElement>) => {
    const newTheme = e.currentTarget.getAttribute("data-theme") as ColorTheme;
    if (newTheme) {
      setTheme(newTheme);
    }
  };

  return (
    <ThemeSelectorContainer>
      <Title>Theme Color</Title>
      <ColorOptions>
        {availableThemes.map((themeName) => (
          <ColorOption
            key={themeName}
            color={colorThemes[themeName].primary}
            isSelected={currentTheme === themeName}
            onClick={handleThemeChange}
            data-theme={themeName}
            aria-label={`${themeName} theme`}
            title={`${themeName.charAt(0).toUpperCase() + themeName.slice(1)} theme`}
          />
        ))}
      </ColorOptions>
    </ThemeSelectorContainer>
  );
};

export default ThemeSelector;
