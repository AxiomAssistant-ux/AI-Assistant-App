import { TextStyle } from 'react-native';
import { colors } from './colors';

// ============================================
// TYPOGRAPHY
// ============================================

export const fontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const fontSizes = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
};

export const lineHeights = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.625,
};

// Text styles
export const textStyles: Record<string, TextStyle> = {
  // Headings
  h1: {
    fontSize: fontSizes['3xl'],
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes['3xl'] * lineHeights.tight,
    color: colors.text.primary,
  },
  h2: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes['2xl'] * lineHeights.tight,
    color: colors.text.primary,
  },
  h3: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.xl * lineHeights.tight,
    color: colors.text.primary,
  },
  h4: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.lg * lineHeights.tight,
    color: colors.text.primary,
  },

  // Body text
  body: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.base * lineHeights.normal,
    color: colors.text.primary,
  },
  bodyMedium: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.base * lineHeights.normal,
    color: colors.text.primary,
  },
  bodySemibold: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.base * lineHeights.normal,
    color: colors.text.primary,
  },

  // Small text
  small: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.sm * lineHeights.normal,
    color: colors.text.secondary,
  },
  smallMedium: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.sm * lineHeights.normal,
    color: colors.text.secondary,
  },

  // Extra small
  xs: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.xs * lineHeights.normal,
    color: colors.text.tertiary,
  },
  xsMedium: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.xs * lineHeights.normal,
    color: colors.text.tertiary,
  },

  // Label
  label: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.sm * lineHeights.tight,
    color: colors.text.secondary,
    letterSpacing: 0.3,
  },

  // Button
  button: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.base * lineHeights.tight,
  },
  buttonSmall: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.sm * lineHeights.tight,
  },
};

export default { fontWeights, fontSizes, lineHeights, textStyles };
