import { Platform, ViewStyle } from 'react-native';

// ============================================
// SHADOWS
// Premium soft shadows for depth
// ============================================

interface Shadow {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

const createShadow = (
  offsetY: number,
  radius: number,
  opacity: number,
  elevation: number
): Shadow => ({
  shadowColor: '#000',
  shadowOffset: { width: 0, height: offsetY },
  shadowOpacity: opacity,
  shadowRadius: radius,
  elevation,
});

export const shadows: Record<string, Shadow> = {
  none: createShadow(0, 0, 0, 0),
  xs: createShadow(1, 2, 0.05, 1),
  sm: createShadow(1, 3, 0.08, 2),
  md: createShadow(2, 6, 0.1, 4),
  lg: createShadow(4, 10, 0.12, 8),
  xl: createShadow(8, 16, 0.15, 12),
  '2xl': createShadow(12, 24, 0.18, 16),
};

// Card shadow (commonly used)
export const cardShadow: Shadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 8,
  elevation: 3,
};

// Soft inset-like appearance for inputs
export const inputShadow: Shadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.04,
  shadowRadius: 2,
  elevation: 1,
};

// Floating button/FAB shadow
export const fabShadow: Shadow = {
  shadowColor: '#4F46E5',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  elevation: 8,
};

export default shadows;
