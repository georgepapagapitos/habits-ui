import { useEffect, useState } from "react";
import { ConfettiContainer, ConfettiPiece } from "./confetti.styles.ts";

export interface ConfettiProps {
  /**
   * Number of confetti pieces to show
   */
  count?: number;
  /**
   * Array of colors to use for the confetti
   */
  colors?: string[];
  /**
   * Duration of the animation in seconds
   */
  duration?: number;
  /**
   * When true, confetti will be triggered
   */
  active?: boolean;
  /**
   * Container width (default: 100%)
   */
  width?: string;
  /**
   * Container height (default: 100%)
   */
  height?: string;
}

export const Confetti = ({
  count = 25,
  colors = ["#FFC700", "#FF0099", "#00C3FF", "#53D75F", "#FF8A00", "#B15DFF"],
  duration = 0.8,
  active = false,
  width = "100%",
  height = "100%",
}: ConfettiProps) => {
  const [isVisible, setIsVisible] = useState(active);

  // Reset visibility when active changes
  useEffect(() => {
    if (active) {
      setIsVisible(true);

      // Automatically hide confetti after animation completes
      const timer = setTimeout(
        () => {
          setIsVisible(false);
        },
        duration * 1000 + 100
      );

      return () => clearTimeout(timer);
    }
  }, [active, duration]);

  if (!isVisible) return null;

  return (
    <ConfettiContainer $width={width} $height={height}>
      {Array.from({ length: count }).map((_, i) => {
        const randomX = Math.random() * 100;
        const randomDelay = Math.random() * 0.3;
        const randomColor = colors[i % colors.length];

        return (
          <ConfettiPiece
            key={i}
            $color={randomColor}
            $duration={duration}
            style={{
              left: `${randomX}%`,
              animationDelay: `${randomDelay}s`,
            }}
          />
        );
      })}
    </ConfettiContainer>
  );
};
