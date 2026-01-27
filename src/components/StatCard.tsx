import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSizes, fontWeights, borderRadius } from '../theme';
import { cardShadow } from '../theme/shadows';

type StatVariant = 'default' | 'warning' | 'danger' | 'success' | 'info';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: keyof typeof Ionicons.glyphMap;
  variant?: StatVariant;
  subtitle?: string;
  onPress?: () => void;
  style?: ViewStyle;
  size?: 'sm' | 'md' | 'lg';
}

const variantColors: Record<StatVariant, { bg: string; icon: string; text: string }> = {
  default: {
    bg: colors.gray[50],
    icon: colors.gray[500],
    text: colors.text.primary,
  },
  warning: {
    bg: colors.warning[50],
    icon: colors.warning[600],
    text: colors.warning[700],
  },
  danger: {
    bg: colors.error[50],
    icon: colors.error[500],
    text: colors.error[600],
  },
  success: {
    bg: colors.success[50],
    icon: colors.success[500],
    text: colors.success[600],
  },
  info: {
    bg: colors.info[50],
    icon: colors.info[500],
    text: colors.info[600],
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  variant = 'default',
  subtitle,
  onPress,
  style,
  size = 'md',
}) => {
  const variantStyle = variantColors[variant];

  const iconSize = size === 'sm' ? 20 : size === 'lg' ? 28 : 24;
  const valueSize = size === 'sm' ? fontSizes.xl : size === 'lg' ? fontSizes['3xl'] : fontSizes['2xl'];

  const content = (
    <View style={[styles.container, { backgroundColor: colors.white }, style]}>
      <View style={[styles.iconContainer, { backgroundColor: variantStyle.bg }]}>
        <Ionicons name={icon} size={iconSize} color={variantStyle.icon} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={[styles.value, { fontSize: valueSize, color: variantStyle.text }]}>
          {value}
        </Text>
        {subtitle && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
      {onPress && (
        <Ionicons
          name="chevron-forward"
          size={18}
          color={colors.gray[400]}
          style={styles.chevron}
        />
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...cardShadow,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.medium,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  value: {
    fontWeight: fontWeights.bold,
  },
  subtitle: {
    fontSize: fontSizes.xs,
    color: colors.text.muted,
    marginTop: spacing.xs,
  },
  chevron: {
    marginLeft: spacing.sm,
  },
});

export default StatCard;
