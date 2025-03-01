export const getRandomColorFrom = (colors: string[]) => {
  return colors[Math.floor(Math.random() * colors.length)];
};

export const getRandomGradientFrom = (colors: string[], opacity?: number) => {
  const color1 = getRandomColorFrom(colors);
  const color2 = getRandomColorFrom(colors);

  // If opacity is provided, apply it to the colors
  const c1 = opacity !== undefined ? `${color1}${opacity}` : color1;
  const c2 = opacity !== undefined ? `${color2}${opacity}` : color2;

  return `linear-gradient(135deg, ${c1}, ${c2})`;
};
