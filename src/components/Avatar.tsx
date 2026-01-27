import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle, ImageStyle, StyleProp } from 'react-native';
import { colors, borderRadius, fontSizes, fontWeights } from '../theme';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  name?: string;
  imageUrl?: string;
  size?: AvatarSize;
  style?: StyleProp<ViewStyle | ImageStyle>;
}

const sizeMap: Record<AvatarSize, { container: number; text: number }> = {
  xs: { container: 24, text: fontSizes.xs },
  sm: { container: 32, text: fontSizes.sm },
  md: { container: 40, text: fontSizes.base },
  lg: { container: 48, text: fontSizes.lg },
  xl: { container: 64, text: fontSizes['2xl'] },
};

const getInitials = (name?: string): string => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const getBackgroundColor = (name?: string): string => {
  if (!name) return colors.gray[400];

  const colorOptions = [
    colors.primary[500],
    colors.success[500],
    colors.warning[500],
    colors.info[500],
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#14B8A6', // Teal
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colorOptions[Math.abs(hash) % colorOptions.length];
};

export const Avatar: React.FC<AvatarProps> = ({
  name,
  imageUrl,
  size = 'md',
  style,
}) => {
  const dimensions = sizeMap[size];
  const containerStyle = {
    width: dimensions.container,
    height: dimensions.container,
    borderRadius: dimensions.container / 2,
  };

  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={[styles.image, containerStyle, style as ImageStyle]}
      />
    );
  }

  return (
    <View
      style={[
        styles.container,
        containerStyle,
        { backgroundColor: getBackgroundColor(name) },
        style,
      ]}
    >
      <Text style={[styles.initials, { fontSize: dimensions.text }]}>
        {getInitials(name)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    resizeMode: 'cover',
  },
  initials: {
    color: colors.white,
    fontWeight: fontWeights.semibold,
  },
});

export default Avatar;
