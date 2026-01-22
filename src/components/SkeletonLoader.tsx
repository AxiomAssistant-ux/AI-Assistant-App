import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle, Dimensions } from 'react-native';
import { colors, borderRadius, spacing } from '../theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  borderRadius: radius = borderRadius.md,
  style,
}) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: width as any,
          height,
          borderRadius: radius,
          opacity,
        },
        style,
      ]}
    />
  );
};

// Pre-built skeleton layouts
export const CardSkeleton: React.FC<{ style?: ViewStyle }> = ({ style }) => (
  <View style={[styles.cardSkeleton, style]}>
    <View style={styles.cardHeader}>
      <Skeleton width={60} height={24} borderRadius={borderRadius.full} />
      <Skeleton width={80} height={20} />
    </View>
    <Skeleton width="70%" height={20} style={{ marginTop: spacing.md }} />
    <Skeleton width="100%" height={14} style={{ marginTop: spacing.sm }} />
    <Skeleton width="90%" height={14} style={{ marginTop: spacing.xs }} />
    <View style={styles.cardFooter}>
      <Skeleton width={100} height={16} />
      <Skeleton width={32} height={32} borderRadius={borderRadius.full} />
    </View>
  </View>
);

export const ListItemSkeleton: React.FC<{ style?: ViewStyle }> = ({ style }) => (
  <View style={[styles.listItemSkeleton, style]}>
    <Skeleton width={48} height={48} borderRadius={borderRadius.lg} />
    <View style={styles.listItemContent}>
      <Skeleton width="60%" height={16} />
      <Skeleton width="80%" height={12} style={{ marginTop: spacing.xs }} />
    </View>
  </View>
);

export const DetailSkeleton: React.FC = () => (
  <View style={styles.detailSkeleton}>
    <View style={styles.detailHeader}>
      <Skeleton width={80} height={28} borderRadius={borderRadius.full} />
      <Skeleton width={100} height={24} />
    </View>
    <Skeleton width="80%" height={24} style={{ marginTop: spacing.lg }} />
    <Skeleton width="100%" height={60} style={{ marginTop: spacing.md }} />

    <Skeleton width={120} height={18} style={{ marginTop: spacing['2xl'] }} />
    <View style={styles.detailInfo}>
      <Skeleton width="45%" height={50} />
      <Skeleton width="45%" height={50} />
    </View>

    <Skeleton width={100} height={18} style={{ marginTop: spacing.xl }} />
    <View style={styles.detailActions}>
      <Skeleton width="48%" height={44} borderRadius={borderRadius.lg} />
      <Skeleton width="48%" height={44} borderRadius={borderRadius.lg} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.gray[200],
  },
  cardSkeleton: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  listItemSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  listItemContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  detailSkeleton: {
    padding: spacing.lg,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  detailActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
});

export default Skeleton;
