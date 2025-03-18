import React from "react";
import { LoadingSpinner, SpinnerContainer } from "./spinner.styles";

interface SpinnerProps {
  size?: "small" | "medium" | "large";
  label?: string;
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = "medium",
  label = "Loading",
  className,
}) => {
  return (
    <SpinnerContainer className={className}>
      <LoadingSpinner $size={size} aria-label={label} />
      {label && <div className="sr-only">{label}</div>}
    </SpinnerContainer>
  );
};
