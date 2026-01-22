import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSizes, fontWeights, shadows } from '../theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const variantStyles: Record<
  ButtonVariant,
  { bg: string; text: string; border?: string; activeBg: string }
> = {
  primary: {
    bg: colors.primary[600],
    text: colors.white,
    activeBg: colors.primary[700],
  },
  secondary: {
    bg: colors.gray[100],
    text: colors.gray[700],
    activeBg: colors.gray[200],
  },
  outline: {
    bg: 'transparent',
    text: colors.primary[600],
    border: colors.primary[600],
    activeBg: colors.primary[50],
  },
  ghost: {
    bg: 'transparent',
    text: colors.gray[700],
    activeBg: colors.gray[100],
  },
  danger: {
    bg: colors.error[600],
    text: colors.white,
    activeBg: colors.error[700],
  },
};

const sizeStyles: Record<
  ButtonSize,
  { paddingH: number; paddingV: number; fontSize: number; iconSize: number }
> = {
  sm: {
    paddingH: spacing.md,
    paddingV: spacing.sm,
    fontSize: fontSizes.sm,
    iconSize: 16,
  },
  md: {
    paddingH: spacing.lg,
    paddingV: spacing.md,
    fontSize: fontSizes.base,
    iconSize: 18,
  },
  lg: {
    paddingH: spacing.xl,
    paddingV: spacing.lg,
    fontSize: fontSizes.md,
    iconSize: 20,
  },
};

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
}) => {
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.base,
        {
          backgroundColor: variantStyle.bg,
          paddingHorizontal: sizeStyle.paddingH,
          paddingVertical: sizeStyle.paddingV,
          borderColor: variantStyle.border || 'transparent',
          borderWidth: variantStyle.border ? 1.5 : 0,
          opacity: isDisabled ? 0.5 : 1,
        },
        fullWidth && styles.fullWidth,
        variant === 'primary' && shadows.sm,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variantStyle.text}
        />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && (
            <Ionicons
              name={icon as any}
              size={sizeStyle.iconSize}
              color={variantStyle.text}
              style={styles.iconLeft}
            />
          )}
          <Text
            style={[
              styles.text,
              {
                color: variantStyle.text,
                fontSize: sizeStyle.fontSize,
              },
              textStyle,
            ]}
          >
            {label}
          </Text>
          {icon && iconPosition === 'right' && (
            <Ionicons
              name={icon as any}
              size={sizeStyle.iconSize}
              color={variantStyle.text}
              style={styles.iconRight}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

// Icon-only button
interface IconButtonProps {
  icon: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  style?: ViewStyle;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  variant = 'ghost',
  size = 'md',
  disabled = false,
  style,
}) => {
  const variantStyle = variantStyles[variant];
  const iconSize = size === 'sm' ? 18 : size === 'md' ? 22 : 26;
  const padding = size === 'sm' ? spacing.sm : size === 'md' ? spacing.md : spacing.lg;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={[
        styles.iconButton,
        {
          backgroundColor: variantStyle.bg,
          padding,
          borderColor: variantStyle.border || 'transparent',
          borderWidth: variantStyle.border ? 1.5 : 0,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      <Ionicons name={icon as any} size={iconSize} color={variantStyle.text} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: fontWeights.semibold,
  },
  iconLeft: {
    marginRight: spacing.sm,
  },
  iconRight: {
    marginLeft: spacing.sm,
  },
  iconButton: {
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Button;
