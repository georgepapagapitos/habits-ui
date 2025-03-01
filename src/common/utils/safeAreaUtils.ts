export const safeAreaInsets = {
  top: "env(safe-area-inset-top, 0px)",
  bottom: "env(safe-area-inset-bottom, 0px)",
  left: "env(safe-area-inset-left, 0px)",
  right: "env(safe-area-inset-right, 0px)",
};

export const withSafeArea = (
  baseValue: string | number,
  insetDirection: keyof typeof safeAreaInsets
): string => {
  // Convert number to pixel string if needed
  const base = typeof baseValue === "number" ? `${baseValue}px` : baseValue;
  return `calc(${base} + ${safeAreaInsets[insetDirection]})`;
};
