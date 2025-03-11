import styled from "styled-components";

export const Container = styled.div`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.small};
  margin-top: 2rem;

  h3 {
    margin-bottom: 1rem;
    font-size: 1.2rem;
  }

  p {
    margin-bottom: 0.5rem;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

export const GalleryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
`;

export const PhotoCard = styled.div`
  background-color: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.medium};
  overflow: hidden;
  transition: transform 0.2s ease-in-out;
  display: flex;
  flex-direction: column;
  height: 100%;

  &:hover {
    transform: scale(1.02);
  }

  h3 {
    padding: 0.75rem;
    margin: 0;
    font-size: 1rem;
    background-color: ${({ theme }) => theme.colors.primary};
    color: white;
  }
`;

export const PhotoImage = styled.img<{ $width: number; $height: number }>`
  width: 100%;
  height: auto;
  display: block;
  object-fit: contain;
  background-color: #f5f5f5;
  padding: 10px;
  box-sizing: border-box;
  flex: 1;
  min-height: 250px;
  max-height: 350px;
`;
