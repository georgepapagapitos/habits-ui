import styled from "styled-components";

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

export const NavItem = styled.button`
  border: none;
  background: transparent;
  padding: ${({ theme }) => theme.spacing.sm};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.primaryText};
  cursor: pointer;
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
`;
