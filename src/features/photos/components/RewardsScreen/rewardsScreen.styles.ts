import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 16px;
`;

export const PhotoContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  margin-top: 20px;
`;

export const PhotoCard = styled.div`
  position: relative;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.12);
  transition: all 0.3s ease;
  aspect-ratio: 4/3;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
  }

  &:after {
    content: "🔍";
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: rgba(255, 255, 255, 0.7);
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  &:hover:after {
    opacity: 1;
  }
`;

export const PhotoImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain; /* Changed from cover to contain */
  background-color: #f5f5f5;
  padding: 8px;
  box-sizing: border-box;
`;

export const PhotoPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
  font-size: 14px;
  padding: 20px;
  text-align: center;
  border-radius: 8px;
`;

export const Title = styled.h2`
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: #333;
`;

export const Subtitle = styled.h3`
  font-size: 16px;
  font-weight: 500;
  margin: 10px 0;
  color: #555;
`;

export const Message = styled.p`
  color: #666;
  line-height: 1.5;
  margin-bottom: 20px;
`;

export const InfoSection = styled.div`
  background-color: #f9f9f9;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
`;

export const Button = styled.button`
  background-color: #5c6bc0;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: background-color 0.2s ease;
  width: 100%;
  margin-top: 10px;

  &:hover {
    background-color: #3f51b5;
  }

  &:disabled {
    background-color: #c5cae9;
    cursor: not-allowed;
  }
`;

export const AlbumGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
  margin-top: 20px;
  margin-bottom: 20px;
`;

export const AlbumCard = styled.div<{ $selected?: boolean }>`
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  border: ${(props) =>
    props.$selected ? "3px solid #3f51b5" : "1px solid #e0e0e0"};
  box-shadow: ${(props) =>
    props.$selected
      ? "0 6px 12px rgba(63, 81, 181, 0.15)"
      : "0 2px 8px rgba(0, 0, 0, 0.08)"};
  transition: all 0.3s ease;
  position: relative;
  background-color: white;
  height: 180px;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
    border-color: ${(props) => (props.$selected ? "#3f51b5" : "#bbbbbb")};
  }
`;

export const AlbumCover = styled.img`
  width: 100%;
  height: 140px;
  object-fit: cover;
  flex: 1;
`;

export const AlbumTitle = styled.div`
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 500;
  background-color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const SelectionIndicator = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #3f51b5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 2;
`;

export const ExpandedPhotoContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
`;

export const ExpandedPhotoImage = styled.img`
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  border-radius: 8px;
  background-color: #f5f5f5;
`;

export const ExpandedPhotoCaption = styled.div`
  margin-top: 12px;
  font-size: 14px;
  color: #666;
  text-align: center;
`;
