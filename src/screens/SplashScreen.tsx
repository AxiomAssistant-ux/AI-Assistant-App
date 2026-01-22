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
      // Small delay for splash effect
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const isAuthenticated = await checkAuth();
      onAuthChecked(isAuthenticated);
    };

    checkAuthentication();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>SR</Text>
        </View>
      </View>
      <Text style={styles.appName}>Store Response</Text>
      <Text style={styles.tagline}>Resolve issues instantly</Text>
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
  },
  logoContainer: {
    marginBottom: spacing.xl,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary[600],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  logoText: {
    fontSize: 40,
    fontWeight: fontWeights.bold,
    color: colors.white,
  },
  appName: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  tagline: {
    fontSize: fontSizes.base,
    color: colors.text.secondary,
    marginBottom: spacing['3xl'],
  },
  loader: {
    marginTop: spacing.xl,
  },
});

export default SplashScreen;
