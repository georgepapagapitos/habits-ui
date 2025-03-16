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
    color: ${({ theme }) => theme.colors.textLight};
  }
`;

export const GalleryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
`;

export const PhotoCard = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.medium};
  overflow: hidden;
  transition: all 0.3s ease-in-out;
  display: flex;
  flex-direction: column;
  height: 100%;

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.shadows.large};
  }

  h3 {
    padding: 0.75rem;
    margin: 0;
    font-size: 1rem;
    background-color: ${({ theme }) => theme.colors.primary};
    color: white;
    text-align: center;
  }
`;

export const PhotoImage = styled.img<{ $width: number; $height: number }>`
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  background-color: #f0f0f0;
  aspect-ratio: 4/3;
  box-sizing: border-box;
  transition: transform 0.5s ease-in-out;

  ${({ $width, $height }) => {
    // Calculate the aspect ratio
    const aspectRatio = $width && $height ? $width / $height : 4 / 3;

    // If it's portrait (taller than wide), use different settings
    if (aspectRatio < 0.8) {
      return `
        aspect-ratio: 3/4;
        object-position: center;
      `;
    } else if (aspectRatio > 1.8) {
      // Very wide panorama
      return `
        aspect-ratio: 16/9;
        object-position: center;
      `;
    }

    return "";
  }}

  &:hover {
    transform: scale(1.03);
  }
`;
