import styled, { css } from "styled-components";

export const MenuContainer = styled.div`
  position: relative;
  display: inline-block;
`;

export const MenuList = styled.ul`
  position: absolute;
  top: 32px; /* Match the height of the button */
  right: 0;
  z-index: 100;
  min-width: 180px;
  margin: ${({ theme }) => theme.spacing.xs} 0 0;
  padding: ${({ theme }) => theme.spacing.xs} 0;
  list-style: none;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  box-shadow: ${({ theme }) => theme.shadows.medium};
  overflow: hidden;
`;

export const MenuItem = styled.li`
  margin: 0;
  padding: 0;
`;

export const MenuItemButton = styled.button<{
  $variant?: "default" | "danger";
}>`
  display: flex;
  align-items: center;
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: none;
  background: none;
  text-align: left;
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  cursor: pointer;
  transition: background-color
    ${({ theme }) => theme.animations.transitions.short};

  ${({ $variant, theme }) =>
    $variant === "danger"
      ? css`
          color: ${theme.colors.error};
          &:hover:not(:disabled) {
            background-color: ${theme.colors.error + "10"};
          }
        `
      : css`
          color: ${theme.colors.text};
          &:hover:not(:disabled) {
            background-color: ${theme.colors.backgroundAlt};
          }
        `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const MenuItemIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: ${({ theme }) => theme.spacing.sm};
  width: 16px;
  height: 16px;
`;

export const MenuItemContent = styled.span`
  flex: 1;
`;

export const MenuDivider = styled.div`
  height: 1px;
  margin: ${({ theme }) => theme.spacing.xs} 0;
  background-color: ${({ theme }) => theme.colors.borderLight};
`;
