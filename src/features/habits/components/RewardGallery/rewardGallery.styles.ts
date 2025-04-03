import styled from "styled-components";

export const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

export const Title = styled.h2`
  color: ${({ theme }) => theme.colors.primaryDark};
  margin-bottom: 1rem;
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: 8px;
  box-shadow: ${({ theme }) => theme.shadows.small};
  margin: 1rem 0;

  h3 {
    color: ${({ theme }) => theme.colors.primaryDark};
    margin-bottom: 1rem;
  }

  p {
    color: ${({ theme }) => theme.colors.textLight};
    margin-bottom: 1.5rem;
  }

  button {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background: ${({ theme }) => theme.colors.primaryDark};
    }

    &:focus {
      outline: none;
      box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primaryLight};
    }
  }

  a {
    display: inline-block;
    background: ${({ theme }) => theme.colors.primary};
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    text-decoration: none;
    margin-top: 1rem;
    transition: background-color 0.2s;

    &:hover {
      background: ${({ theme }) => theme.colors.primaryDark};
    }

    &:focus {
      outline: none;
      box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primaryLight};
    }
  }
`;

export const GalleryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
  width: 100%;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1rem;
  }

  /* Fix for Safari/iOS grid issues */
  @supports (-webkit-touch-callout: none) {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;

    & > * {
      flex: 0 0 auto;
      width: 85%;
      margin-bottom: 1rem;
    }

    @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
      & > * {
        flex: 0 0 auto;
        width: 42%;
        margin: 0 1% 1rem 1%;
      }
    }

    @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
      & > * {
        flex: 0 0 auto;
        width: 30%;
        margin: 0 1% 1rem 1%;
      }
    }
  }
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
  position: relative;
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
  will-change: transform;

  /* Fix for iOS to eliminate white space */
  @supports (-webkit-touch-callout: none) {
    display: flex;
    flex-direction: column;
    height: auto;
    max-height: 400px;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.shadows.large};
  }

  &:focus-within {
    outline: 2px solid ${({ theme }) => theme.colors.focus};
    outline-offset: 2px;
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

export const PhotoImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 75%; /* 4:3 aspect ratio */
  overflow: hidden;
  background-color: #f0f0f0;
  flex-grow: 1;
  transform: translateZ(0);
  -webkit-transform: translateZ(0);

  /* Fix specific to iOS to eliminate white space */
  @supports (-webkit-touch-callout: none) {
    height: auto;
    padding-bottom: 0;
    flex: 1;
    aspect-ratio: 4/3;

    /* Force container to expand to content */
    &::after {
      content: "";
      display: block;
      padding-bottom: 0;
    }
  }
`;

export const PhotoImage = styled.img<{ $width: number; $height: number }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  background-color: #f0f0f0;
  box-sizing: border-box;
  transition: transform 0.5s ease-in-out;
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
  will-change: transform;

  ${({ $width, $height }) => {
    // Calculate the aspect ratio
    const aspectRatio = $width && $height ? $width / $height : 4 / 3;

    // Different object-position based on aspect ratio
    if (aspectRatio < 0.8) {
      // Portrait image
      return `
        object-position: center;
      `;
    } else if (aspectRatio > 1.8) {
      // Very wide panorama
      return `
        object-position: center;
      `;
    }

    return "";
  }}

  /* Fix for iOS Safari */
  @supports (-webkit-touch-callout: none) {
    position: relative;
    height: auto !important;
    min-height: 300px;
    aspect-ratio: 4/3;
    width: 100% !important;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    object-fit: cover;
    display: block;
  }

  &:hover {
    transform: scale(1.03);
  }
`;

export const RevealOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #fff;
  background-color: rgba(0, 0, 0, 0.6);
  padding: 10px 20px;
  border-radius: 30px;
  pointer-events: none;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 0.5px;
  backdrop-filter: blur(4px);
  z-index: 2;
`;

export const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 12px;
  text-align: center;
  padding: 10px;
  position: absolute;
  bottom: 0;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.8);
`;
