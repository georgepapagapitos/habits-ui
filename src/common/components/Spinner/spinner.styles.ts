import styled, { keyframes } from "styled-components";

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

export const SpinnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
`;

interface LoadingSpinnerProps {
  $size?: "small" | "medium" | "large";
}

export const LoadingSpinner = styled.div.attrs<LoadingSpinnerProps>(
  ({ "aria-label": label }) => ({
    role: "status",
    "aria-label": label || "Loading",
  })
)<LoadingSpinnerProps>`
  display: block;
  width: ${({ $size }) =>
    $size === "small" ? "24px" : $size === "large" ? "56px" : "40px"};
  height: ${({ $size }) =>
    $size === "small" ? "24px" : $size === "large" ? "56px" : "40px"};
  margin: ${({ theme }) => theme.spacing.xs} auto;
  border: ${({ $size }) =>
      $size === "small" ? "3px" : $size === "large" ? "5px" : "4px"}
    solid ${({ theme }) => theme.colors.primaryLight};
  border-top: ${({ $size }) =>
      $size === "small" ? "3px" : $size === "large" ? "5px" : "4px"}
    solid ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;
