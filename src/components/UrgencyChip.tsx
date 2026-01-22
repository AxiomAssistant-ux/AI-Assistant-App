import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UrgencyLevel, SeverityLevel } from '../lib/types';
import { colors, spacing, borderRadius, fontSizes, fontWeights } from '../theme';

interface UrgencyChipProps {
  level: UrgencyLevel | SeverityLevel;
  type?: 'urgency' | 'severity';
  size?: 'sm' | 'md';
  showIcon?: boolean;
}

const urgencyConfig: Record<
  UrgencyLevel | SeverityLevel,
  { label: string; color: string; bgColor: string; icon: string }
> = {
  low: {
    label: 'Low',
    color: colors.success[600],
    bgColor: colors.success[50],
    icon: 'chevron-down-outline',
  },
  medium: {
    label: 'Medium',
    color: colors.warning[600],
    bgColor: colors.warning[50],
    icon: 'remove-outline',
  },
  high: {
    label: 'High',
    color: '#F97316', // Orange 500
    bgColor: '#FFF7ED', // Orange 50
    icon: 'chevron-up-outline',
  },
  critical: {
    label: 'Critical',
    color: colors.error[600],
    bgColor: colors.error[50],
    icon: 'alert-circle-outline',
  },
};

export const UrgencyChip: React.FC<UrgencyChipProps> = ({
  level,
  type = 'urgency',
  size = 'md',
  showIcon = true,
}) => {
  const config = urgencyConfig[level];
  const isSmall = size === 'sm';
  const isCritical = level === 'critical';
  const isHigh = level === 'high';

  return (
    <View
      style={[
        styles.container,
        isSmall && styles.containerSm,
        {
          backgroundColor: config.bgColor,
          borderColor: (isCritical || isHigh) ? config.color : 'transparent',
          borderWidth: (isCritical || isHigh) ? 1 : 0,
        },
      ]}
    >
      {showIcon && (
        <Ionicons
          name={config.icon as any}
          size={isSmall ? 12 : 14}
          color={config.color}
          style={styles.icon}
        />
      )}
      <Text
        style={[
          styles.label,
          isSmall && styles.labelSm,
          { color: config.color },
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    alignSelf: 'flex-start',
  },
  containerSm: {
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  icon: {
    marginRight: 4,
  },
  label: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
  },
  labelSm: {
    fontSize: fontSizes.xs,
  },
});

export default UrgencyChip;
