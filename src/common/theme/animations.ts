/**
 * Animation timing tokens for consistent animation across the application
 */
export const animations = {
  transitions: {
    short: "0.2s ease",
    medium: "0.3s ease",
    long: "0.5s ease-in-out",
  },
};

/**
 * More granular animation control with separate duration and easing
 */
export const ANIMATION = {
  duration: {
    shortest: "0.15s",
    short: "0.2s",
    medium: "0.3s",
    standard: "0.5s",
    long: "0.6s",
    longer: "0.8s",
  },
  easing: {
    default: "ease",
    in: "ease-in",
    out: "ease-out",
    inOut: "ease-in-out",
    bouncy: "cubic-bezier(0.25, 0.1, 0.25, 1.25)",
    elastic: "cubic-bezier(0.5, -0.5, 0.5, 1.5)",
    spin: "ease-in-out",
  },
};

/**
 * Helper to create consistent transition strings
 * @param properties Array of CSS properties to transition
 * @param duration Duration from ANIMATION.duration
 * @param easing Easing function from ANIMATION.easing
 * @returns Formatted transition string
 */
export const createTransition = (
  properties: string[] = ["all"],
  duration: keyof typeof ANIMATION.duration = "medium",
  easing: keyof typeof ANIMATION.easing = "default"
): string => {
  return properties
    .map(
      (property) =>
        `${property} ${ANIMATION.duration[duration]} ${ANIMATION.easing[easing]}`
    )
    .join(", ");
};
