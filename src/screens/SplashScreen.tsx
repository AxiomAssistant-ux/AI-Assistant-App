import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useAuthStore } from '../stores';
import { colors, spacing, fontSizes, fontWeights } from '../theme';

interface SplashScreenProps {
  onAuthChecked: (isAuthenticated: boolean) => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onAuthChecked }) => {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    const checkAuthentication = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      const isAuthenticated = await checkAuth();
      onAuthChecked(isAuthenticated);
    };

    checkAuthentication();
  }, []);

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image
        source={require('../../assets/splash.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* App Name */}
      <Text style={styles.appName}>McDonald's Assistant</Text>

      {/* Tagline */}
      <Text style={styles.tagline}>Resolve customer issues faster</Text>

      {/* Loader */}
      <ActivityIndicator
        size="large"
        color={colors.primary[500]}
        style={styles.loader}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },

  logo: {
    width: 120,
    height: 120,
    marginBottom: spacing.xl,
  },

  appName: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },

  tagline: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing['3xl'],
    textAlign: 'center',
    maxWidth: 260,
  },

  loader: {
    marginTop: spacing.lg,
  },
});

export default SplashScreen;
