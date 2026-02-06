

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore, showError } from '../stores';
import { Input, Button } from '../components';
import { colors, spacing, fontSizes, fontWeights, borderRadius } from '../theme';

export const LoginScreen: React.FC = () => {
  // const [email, setEmail] = useState('admin@mcdonalds.com');
  // const [password, setPassword] = useState('demo123');
  const [email, setEmail] = useState('jimmykuddon@gmail.com');
  const [password, setPassword] = useState('User@123');
  const [showPassword, setShowPassword] = useState(false);

  const { login, isLoading, error, clearError } = useAuthStore();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      showError('Please enter your email and password');
      return;
    }

    try {
      await login(email.trim(), password);
    } catch (_) {
      // handled globally
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Image
              source={require('../../assets/icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Sign in to manage complaints and store activity
            </Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Input
              label="Email address"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (error) clearError();
              }}
              placeholder="name@company.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              leftIcon="mail-outline"
            />

            <Input
              label="Password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (error) clearError();
              }}
              placeholder="Enter your password"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              leftIcon="lock-closed-outline"
              rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
              onRightIconPress={() => setShowPassword(!showPassword)}
            />

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Button
              label="Sign In"
              onPress={handleLogin}
              loading={isLoading}
              fullWidth
              style={styles.loginButton}
            />
          </View>

          {/* Footer */}
          <Text style={styles.footerText}>
            © {new Date().getFullYear()} McDonald's Assistant
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
  },

  /* Header */
  header: {
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  logo: {
    width: 88,
    height: 88,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    maxWidth: 280,
  },

  /* Card */
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },

  errorContainer: {
    backgroundColor: colors.error[50],
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.error[500],
  },
  errorText: {
    color: colors.error[700],
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
  },

  loginButton: {
    marginTop: spacing.md,
  },

  /* Footer */
  footerText: {
    marginTop: spacing.xl,
    fontSize: fontSizes.xs,
    color: colors.text.muted,
    textAlign: 'center',
  },
});

export default LoginScreen;
