import { describe, it, expect } from 'vitest';
import { hexToRgb, rgbToHex, getComplementaryColor } from '../color';

describe('Color Utilities', () => {
  describe('hexToRgb', () => {
    it('converts valid hex color to RGB', () => {
      expect(hexToRgb('#FF0000')).toEqual({ r: 255, g: 0, b: 0 });
      expect(hexToRgb('#00FF00')).toEqual({ r: 0, g: 255, b: 0 });
      expect(hexToRgb('#0000FF')).toEqual({ r: 0, g: 0, b: 255 });
    });

    it('handles hex without # prefix', () => {
      expect(hexToRgb('FF0000')).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('returns null for invalid hex colors', () => {
      expect(hexToRgb('invalid')).toBeNull();
      expect(hexToRgb('#GG0000')).toBeNull();
      expect(hexToRgb('')).toBeNull();
    });
  });

  describe('rgbToHex', () => {
    it('converts RGB values to hex color', () => {
      expect(rgbToHex(255, 0, 0)).toBe('#ff0000');
      expect(rgbToHex(0, 255, 0)).toBe('#00ff00');
      expect(rgbToHex(0, 0, 255)).toBe('#0000ff');
    });

    it('handles edge cases', () => {
      expect(rgbToHex(0, 0, 0)).toBe('#000000');
      expect(rgbToHex(255, 255, 255)).toBe('#ffffff');
    });
  });

  describe('getComplementaryColor', () => {
    it('returns complementary color for valid hex input', () => {
      expect(getComplementaryColor('#FF0000')).toBe('#00ffff');
      expect(getComplementaryColor('#00FF00')).toBe('#ff00ff');
      expect(getComplementaryColor('#0000FF')).toBe('#ffff00');
    });

    it('handles hex without # prefix', () => {
      expect(getComplementaryColor('FF0000')).toBe('#00ffff');
    });

    it('returns black for invalid hex input', () => {
      expect(getComplementaryColor('invalid')).toBe('#000000');
      expect(getComplementaryColor('#GG0000')).toBe('#000000');
      expect(getComplementaryColor('')).toBe('#000000');
    });
  });
}); 