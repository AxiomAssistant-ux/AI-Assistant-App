import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UrgencyLevel, SeverityLevel } from '../lib/types';
import { colors, spacing, borderRadius, fontSizes, fontWeights } from '../theme';

interface UrgentBannerProps {
  level: UrgencyLevel | SeverityLevel;
  message: string;
  onPress?: () => void;
}

export const UrgentBanner: React.FC<UrgentBannerProps> = ({ level, message, onPress }) => {
  const isCritical = level === 'critical';
  const isHigh = level === 'high';
  const isUrgent = isCritical || isHigh;

  const bgColor = isCritical ? colors.error[50] : isHigh ? '#FFF7ED' : colors.warning[50];
  const borderColor = isCritical ? colors.error[500] : isHigh ? '#F97316' : colors.warning[500];
  const textColor = isCritical ? colors.error[700] : isHigh ? '#C2410C' : colors.warning[700];

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.banner,
        {
          backgroundColor: bgColor,
          borderColor: borderColor,
        },
      ]}
    >
      <View style={styles.iconContainer}>
        <Ionicons
          name={isCritical ? 'alert-circle' : 'warning'}
          size={20}
          color={borderColor}
        />
      </View>
      <Text style={[styles.message, { color: textColor }]} numberOfLines={2}>
        {message}
      </Text>
      {onPress && (
        <Ionicons name="chevron-forward" size={18} color={textColor} />
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  iconContainer: {
    marginRight: spacing.sm,
  },
  message: {
    flex: 1,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.sm * 1.4,
  },
});

export default UrgentBanner;
