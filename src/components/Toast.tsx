import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useToastStore } from '../stores';
import { ToastType } from '../lib/types';
import { colors, spacing, borderRadius, fontSizes, fontWeights, shadows } from '../theme';

const toastConfig: Record<
  ToastType,
  { icon: string; bg: string; border: string; iconColor: string }
> = {
  success: {
    icon: 'checkmark-circle',
    bg: colors.success[50],
    border: colors.success[500],
    iconColor: colors.success[500],
  },
  error: {
    icon: 'alert-circle',
    bg: colors.error[50],
    border: colors.error[500],
    iconColor: colors.error[500],
  },
  warning: {
    icon: 'warning',
    bg: colors.warning[50],
    border: colors.warning[500],
    iconColor: colors.warning[500],
  },
  info: {
    icon: 'information-circle',
    bg: colors.info[50],
    border: colors.info[500],
    iconColor: colors.info[500],
  },
};

interface ToastItemProps {
  id: string;
  type: ToastType;
  message: string;
}

const ToastItem: React.FC<ToastItemProps> = ({ id, type, message }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;
  const hideToast = useToastStore((state) => state.hideToast);
  const config = toastConfig[type];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -20,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      hideToast(id);
    });
  };

  return (
    <Animated.View
      style={[
        styles.toastItem,
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
          backgroundColor: config.bg,
          borderLeftColor: config.border,
        },
      ]}
    >
      <View style={styles.toastContent}>
        <Ionicons
          name={config.icon as any}
          size={20}
          color={config.iconColor}
          style={styles.toastIcon}
        />
        <Text style={styles.toastMessage} numberOfLines={2}>
          {message}
        </Text>
      </View>
      <TouchableOpacity onPress={handleDismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Ionicons name="close" size={18} color={colors.gray[500]} />
      </TouchableOpacity>
    </Animated.View>
  );
};

export const ToastContainer: React.FC = () => {
  const toasts = useToastStore((state) => state.toasts);

  if (toasts.length === 0) return null;

  return (
    <SafeAreaView style={styles.container} pointerEvents="box-none">
      <View style={styles.wrapper} pointerEvents="box-none">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            id={toast.id}
            type={toast.type}
            message={toast.message}
          />
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
  },
  wrapper: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  toastItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    borderLeftWidth: 4,
    ...shadows.lg,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.md,
  },
  toastIcon: {
    marginRight: spacing.sm,
  },
  toastMessage: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    color: colors.text.primary,
    flex: 1,
  },
});

export default ToastContainer;
