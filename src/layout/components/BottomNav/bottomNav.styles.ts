import styled from "styled-components";
import { createTransition } from "@common/theme/animations";

export const Nav = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: ${({ theme }) => theme.colors.primaryLight};
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 -2px 10px ${({ theme }) => theme.colors.shadow};
  padding-bottom: env(safe-area-inset-bottom);
`;

export const NavItem = styled.button<{ $active?: boolean }>`
  border: none;
  background: transparent;
  padding: ${({ theme }) => theme.spacing.sm};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.primaryText};
  cursor: pointer;
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  position: relative;
  transition: ${createTransition(["color"], "short")};

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 30%;
    right: 30%;
    height: 3px;
    background-color: ${({ $active, theme }) =>
      $active ? theme.colors.primary : "transparent"};
    border-radius: ${({ theme }) => theme.borderRadius.small}
      ${({ theme }) => theme.borderRadius.small} 0 0;
    transition: ${createTransition(["background-color"], "short")};
  }
`;
