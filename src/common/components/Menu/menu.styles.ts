import styled, { css } from "styled-components";

export const MenuContainer = styled.div`
  position: relative;
  display: inline-block;
`;

export const MenuList = styled.ul`
  list-style: none;
  margin: 0;
  padding: ${({ theme }) => theme.spacing.xs} 0;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.medium};
  min-width: 160px;
  z-index: 9999;
  max-height: 80vh;
  overflow-y: auto;

  /* Animation for smoother appearance */
  animation: fadeIn 0.1s ease-out forwards;
  transform-origin: top right;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
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
