export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  // Remove the # if present
  hex = hex.replace(/^#/, '');

  // Parse the hex values
  const bigint = parseInt(hex, 16);
  if (isNaN(bigint)) return null;

  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

export function getComplementaryColor(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#000000';

  // Calculate complementary color by subtracting each component from 255
  const complementaryRgb = {
    r: 255 - rgb.r,
    g: 255 - rgb.g,
    b: 255 - rgb.b
  };

  return rgbToHex(complementaryRgb.r, complementaryRgb.g, complementaryRgb.b);
} 