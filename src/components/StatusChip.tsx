import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ComplaintStatus, ActionItemStatus } from '../lib/types';
import { colors, spacing, borderRadius, fontSizes, fontWeights } from '../theme';

type Status = ComplaintStatus | ActionItemStatus;

interface StatusChipProps {
  status: Status;
  size?: 'sm' | 'md';
}

const statusConfig: Record<Status, { label: string; color: string; icon: string }> = {
  pending: {
    label: 'Pending',
    color: colors.warning[500],
    icon: 'time-outline',
  },
  in_progress: {
    label: 'In Progress',
    color: colors.info[500],
    icon: 'play-circle-outline',
  },
  completed: {
    label: 'Completed',
    color: colors.success[500],
    icon: 'checkmark-circle-outline',
  },
  resolved: {
    label: 'Resolved',
    color: colors.success[500],
    icon: 'checkmark-circle-outline',
  },
  dismissed: {
    label: 'Dismissed',
    color: colors.gray[500],
    icon: 'close-circle-outline',
  },
};

export const StatusChip: React.FC<StatusChipProps> = ({ status, size = 'md' }) => {
  const config = statusConfig[status];
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.container,
        isSmall && styles.containerSm,
        { backgroundColor: `${config.color}15` },
      ]}
    >
      <Ionicons
        name={config.icon as any}
        size={isSmall ? 12 : 14}
        color={config.color}
        style={styles.icon}
      />
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
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  containerSm: {
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
  },
  icon: {
    marginRight: 4,
  },
  label: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
  },
  labelSm: {
    fontSize: fontSizes.xs,
  },
});

export default StatusChip;
