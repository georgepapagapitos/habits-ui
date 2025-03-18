import styled from "styled-components";

export const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  max-width: 800px;
  margin: 0 auto;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    padding: ${({ theme }) => theme.spacing.sm};
  }
`;

export const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
`;

export const StatCard = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: ${({ theme }) => theme.spacing.md};
  box-shadow: 0 1px 3px ${({ theme }) => theme.colors.shadow};
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: all 0.2s ease;
  border-top: 2px solid ${({ theme }) => theme.colors.primaryLight};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 5px ${({ theme }) => theme.colors.shadow};
  }

  @media (max-width: 600px) {
    padding: ${({ theme }) => theme.spacing.sm};
  }
`;

export const StatTitle = styled.h3`
  color: ${({ theme }) => theme.colors.textLight};
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
`;

export const StatValue = styled.p`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.fontSizes.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  margin: 0;

  span {
    color: ${({ theme }) => theme.colors.primary};
  }

  small {
    display: block;
    font-size: ${({ theme }) => theme.typography.fontSizes.sm};
    color: ${({ theme }) => theme.colors.textLight};
    font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
    margin-top: ${({ theme }) => theme.spacing.xs};
  }
`;

export const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error};
  text-align: center;
  padding: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  background-color: ${({ theme }) => theme.colors.errorLight};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  margin: ${({ theme }) => theme.spacing.md};
  box-shadow: 0 1px 3px ${({ theme }) => theme.colors.shadow};
`;

export const StatsHeader = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};

  h2 {
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: ${({ theme }) => theme.spacing.xs};
    font-size: ${({ theme }) => theme.typography.fontSizes.xl};
  }

  p {
    color: ${({ theme }) => theme.colors.textLight};
    font-size: ${({ theme }) => theme.typography.fontSizes.md};
    max-width: 600px;
    margin: 0 auto;
  }
`;
