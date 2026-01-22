import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSizes, fontWeights } from '../theme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  leftIcon?: string;
  onLeftPress?: () => void;
  rightIcon?: string;
  onRightPress?: () => void;
  rightComponent?: React.ReactNode;
  style?: ViewStyle;
  transparent?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  leftIcon,
  onLeftPress,
  rightIcon,
  onRightPress,
  rightComponent,
  style,
  transparent = false,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        !transparent && styles.containerSolid,
        { paddingTop: insets.top + spacing.md },
        style,
      ]}
    >
      <View style={styles.row}>
        {leftIcon ? (
          <TouchableOpacity
            onPress={onLeftPress}
            style={styles.iconButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name={leftIcon as any} size={24} color={colors.text.primary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconPlaceholder} />
        )}

        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        {rightComponent ? (
          rightComponent
        ) : rightIcon ? (
          <TouchableOpacity
            onPress={onRightPress}
            style={styles.iconButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name={rightIcon as any} size={24} color={colors.text.primary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconPlaceholder} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  containerSolid: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  iconPlaceholder: {
    width: 40,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
});

export default Header;
