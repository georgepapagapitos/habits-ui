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
  padding: 2rem 1.5rem;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: 1rem;
    justify-content: flex-start;
    padding-top: 2rem;
  }
`;

export const BrandingText = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.textLight};
  margin-top: 2rem;
  font-size: 0.9rem;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    margin-top: 1.5rem;
  }
`;
