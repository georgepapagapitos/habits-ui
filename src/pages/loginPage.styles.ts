import styled from "styled-components";

export const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.md};
  width: 100%;
  max-width: 100%;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: ${({ theme }) => theme.spacing.md};
    padding-top: calc(${({ theme }) => theme.spacing.xl} + 60px);
    justify-content: flex-start;
    margin: 0 auto;
  }
`;

export const BrandingText = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.textLight};
  margin-top: ${({ theme }) => theme.spacing.lg};
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    margin-top: ${({ theme }) => theme.spacing.md};
    font-size: ${({ theme }) => theme.typography.fontSizes.xs};
    padding: 0 ${({ theme }) => theme.spacing.sm};
  }
`;
