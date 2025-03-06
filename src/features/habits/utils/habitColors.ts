import { getRandomColorFrom, getRandomGradientFrom } from "@common/utils";

export const celebrationColors = [
  "#FFD700", // gold
  "#FF6B6B", // coral
  "#4ECB71", // green
  "#45B7D1", // blue
  "#9B6DFF", // purple
];

export const habitGradientColors = [
  "#FF69B4", // hot pink
  "#4169E1", // royal blue
  "#FF6B6B", // coral red
  "#8A2BE2", // blue violet
  "#32CD32", // lime green
  "#FF8C00", // dark orange
  "#A15FCD", // medium purple (matching theme)
  "#FF1493", // deep pink
  "#00CED1", // dark turquoise
  "#9370DB", // medium purple
];

export const getRandomColor = () => {
  return getRandomColorFrom(habitGradientColors);
};

export const getRandomGradient = () => {
  return getRandomGradientFrom(habitGradientColors, 20);
};
