import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, spacing, borderRadius, fontSizes, fontWeights } from '../theme';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
  default: { bg: colors.gray[100], text: colors.gray[700] },
  primary: { bg: colors.primary[100], text: colors.primary[700] },
  success: { bg: colors.success[100], text: colors.success[700] },
  warning: { bg: colors.warning[100], text: colors.warning[700] },
  error: { bg: colors.error[100], text: colors.error[700] },
  info: { bg: colors.info[100], text: colors.info[700] },
};

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'default',
  size = 'md',
  style,
  textStyle,
}) => {
  const variantColor = variantStyles[variant];

  return (
    <View
      style={[
        styles.base,
        size === 'sm' && styles.sm,
        { backgroundColor: variantColor.bg },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          size === 'sm' && styles.textSm,
          { color: variantColor.text },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    alignSelf: 'flex-start',
  },
  sm: {
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  text: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
  },
  textSm: {
    fontSize: fontSizes.xs,
  },
});

export default Badge;
