import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSizes, fontWeights, inputShadow } from '../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
          error && styles.inputWrapperError,
        ]}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon as any}
            size={20}
            color={colors.gray[400]}
            style={styles.leftIcon}
          />
        )}
        <TextInput
          style={[
            styles.input,
            leftIcon && styles.inputWithLeftIcon,
            rightIcon && styles.inputWithRightIcon,
            style,
          ]}
          placeholderTextColor={colors.gray[400]}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
            style={styles.rightIconButton}
          >
            <Ionicons
              name={rightIcon as any}
              size={20}
              color={colors.gray[400]}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

// Multi-line textarea variant
interface TextAreaProps extends InputProps {
  rows?: number;
}

export const TextArea: React.FC<TextAreaProps> = ({ rows = 4, style, ...props }) => {
  return (
    <Input
      {...props}
      multiline
      numberOfLines={rows}
      textAlignVertical="top"
      style={[{ minHeight: rows * 24 + spacing.md * 2 }, style]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border.default,
    borderRadius: borderRadius.lg,
    ...inputShadow,
  },
  inputWrapperFocused: {
    borderColor: colors.primary[500],
  },
  inputWrapperError: {
    borderColor: colors.error[500],
  },
  input: {
    flex: 1,
    fontSize: fontSizes.base,
    color: colors.text.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  inputWithLeftIcon: {
    paddingLeft: spacing.sm,
  },
  inputWithRightIcon: {
    paddingRight: spacing.sm,
  },
  leftIcon: {
    marginLeft: spacing.lg,
  },
  rightIconButton: {
    padding: spacing.md,
    marginRight: spacing.xs,
  },
  errorText: {
    fontSize: fontSizes.sm,
    color: colors.error[500],
    marginTop: spacing.xs,
  },
});

export default Input;
