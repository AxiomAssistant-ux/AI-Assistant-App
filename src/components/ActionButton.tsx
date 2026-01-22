import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSizes, fontWeights, cardShadow } from '../theme';

type ActionButtonVariant = 'call' | 'assign' | 'progress' | 'resolve' | 'default';

interface ActionButtonProps {
  label: string;
  icon: string;
  onPress: () => void;
  variant?: ActionButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  compact?: boolean;
}

const variantStyles: Record<ActionButtonVariant, { bg: string; iconBg: string; text: string }> = {
  call: {
    bg: colors.success[50],
    iconBg: colors.success[500],
    text: colors.success[700],
  },
  assign: {
    bg: colors.primary[50],
    iconBg: colors.primary[500],
    text: colors.primary[700],
  },
  progress: {
    bg: colors.info[50],
    iconBg: colors.info[500],
    text: colors.info[700],
  },
  resolve: {
    bg: colors.success[50],
    iconBg: colors.success[500],
    text: colors.success[700],
  },
  default: {
    bg: colors.gray[50],
    iconBg: colors.gray[500],
    text: colors.gray[700],
  },
};

export const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  icon,
  onPress,
  variant = 'default',
  loading = false,
  disabled = false,
  style,
  compact = false,
}) => {
  const variantStyle = variantStyles[variant];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={[
        styles.container,
        compact && styles.containerCompact,
        { backgroundColor: variantStyle.bg },
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variantStyle.iconBg} />
      ) : (
        <>
          <Ionicons
            name={icon as any}
            size={compact ? 18 : 20}
            color={variantStyle.iconBg}
            style={compact ? styles.iconCompact : styles.icon}
          />
          <Text
            style={[
              styles.label,
              compact && styles.labelCompact,
              { color: variantStyle.text },
            ]}
          >
            {label}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

// Quick action row component
interface QuickActionsProps {
  onCall?: () => void;
  onAssign?: () => void;
  onProgress?: () => void;
  onResolve?: () => void;
  loadingAction?: string | null;
  style?: ViewStyle;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onCall,
  onAssign,
  onProgress,
  onResolve,
  loadingAction,
  style,
}) => {
  return (
    <React.Fragment>
      {onCall && (
        <ActionButton
          label="Call"
          icon="call-outline"
          onPress={onCall}
          variant="call"
          loading={loadingAction === 'call'}
          compact
          style={style}
        />
      )}
      {onAssign && (
        <ActionButton
          label="Assign to me"
          icon="person-add-outline"
          onPress={onAssign}
          variant="assign"
          loading={loadingAction === 'assign'}
          compact
          style={style}
        />
      )}
      {onProgress && (
        <ActionButton
          label="In Progress"
          icon="play-circle-outline"
          onPress={onProgress}
          variant="progress"
          loading={loadingAction === 'progress'}
          compact
          style={style}
        />
      )}
      {onResolve && (
        <ActionButton
          label="Resolve"
          icon="checkmark-circle-outline"
          onPress={onResolve}
          variant="resolve"
          loading={loadingAction === 'resolve'}
          compact
          style={style}
        />
      )}
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    minWidth: 120,
  },
  containerCompact: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minWidth: 0,
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  icon: {
    marginRight: spacing.sm,
  },
  iconCompact: {
    marginRight: spacing.xs,
  },
  label: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
  },
  labelCompact: {
    fontSize: fontSizes.xs,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default ActionButton;
