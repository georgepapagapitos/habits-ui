import styled, { keyframes } from "styled-components";

export const confettiAnimation = keyframes`
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(-150px) rotate(720deg);
    opacity: 0;
  }
`;

export const ConfettiContainer = styled.div<{
  $width: string;
  $height: string;
}>`
  position: absolute;
  top: 0;
  left: 0;
  width: ${(props) => props.$width};
  height: ${(props) => props.$height};
  overflow: hidden;
  pointer-events: none;
  z-index: 100;
`;

export const ConfettiPiece = styled.div<{ $color: string; $duration: number }>`
  position: absolute;
  width: 10px;
  height: 10px;
  background: ${(props) => props.$color};
  border-radius: 50%;
  top: 100%;
  animation: ${confettiAnimation} ${(props) => props.$duration}s ease-out
    forwards;
`;
