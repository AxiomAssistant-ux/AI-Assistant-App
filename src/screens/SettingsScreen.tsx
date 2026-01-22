import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../stores';
import { Card, Avatar, Button } from '../components';
import { config } from '../lib/config';
import { colors, spacing, fontSizes, fontWeights, borderRadius, cardShadow } from '../theme';

interface SettingItemProps {
  icon: string;
  iconColor?: string;
  label: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  iconColor = colors.gray[600],
  label,
  value,
  onPress,
  showChevron = true,
}) => {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      onPress={onPress}
      activeOpacity={0.7}
      style={styles.settingItem}
    >
      <View style={styles.settingItemLeft}>
        <View style={[styles.settingIcon, { backgroundColor: `${iconColor}15` }]}>
          <Ionicons name={icon as any} size={20} color={iconColor} />
        </View>
        <Text style={styles.settingLabel}>{label}</Text>
      </View>
      <View style={styles.settingItemRight}>
        {value && <Text style={styles.settingValue}>{value}</Text>}
        {showChevron && onPress && (
          <Ionicons name="chevron-forward" size={18} color={colors.gray[400]} />
        )}
      </View>
    </Container>
  );
};

export const SettingsScreen: React.FC = () => {
  const { user, organization, logout, isLoading } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => logout(),
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* Profile Card */}
        <Card variant="elevated" style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Avatar name={user?.name} size="xl" imageUrl={user?.avatar_url} />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.name}</Text>
              <Text style={styles.profileRole}>{user?.role_name}</Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
            </View>
          </View>
          {user?.is_admin && (
            <View style={styles.adminBadge}>
              <Ionicons name="shield-checkmark" size={14} color={colors.primary[600]} />
              <Text style={styles.adminBadgeText}>Administrator</Text>
            </View>
          )}
        </Card>

        {/* Organization Branding */}
        <Card variant="elevated" style={styles.orgCard}>
          <Text style={styles.sectionTitle}>Organization</Text>
          <View style={styles.orgHeader}>
            <View style={styles.orgLogoContainer}>
              {organization?.logo_url ? (
                <Image
                  source={{ uri: organization.logo_url }}
                  style={styles.orgLogo}
                />
              ) : (
                <View style={[styles.orgLogoPlaceholder, { backgroundColor: organization?.color_scheme?.primary || colors.primary[600] }]}>
                  <Text style={styles.orgLogoText}>
                    {organization?.company_name?.charAt(0) || 'O'}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.orgInfo}>
              <Text style={styles.orgName}>{organization?.company_name}</Text>
              <Text style={styles.orgStatus}>
                Status: {organization?.status ? organization.status.charAt(0).toUpperCase() + organization.status.slice(1) : 'Active'}
              </Text>
            </View>
          </View>

          {/* Color Scheme Preview */}
          <View style={styles.colorScheme}>
            <Text style={styles.colorSchemeLabel}>Brand Colors</Text>
            <View style={styles.colorSwatches}>
              <View style={styles.colorSwatchItem}>
                <View style={[styles.colorSwatch, { backgroundColor: organization?.color_scheme?.primary || colors.primary[600] }]} />
                <Text style={styles.colorSwatchLabel}>Primary</Text>
              </View>
              <View style={styles.colorSwatchItem}>
                <View style={[styles.colorSwatch, { backgroundColor: organization?.color_scheme?.secondary || colors.primary[400] }]} />
                <Text style={styles.colorSwatchLabel}>Secondary</Text>
              </View>
              <View style={styles.colorSwatchItem}>
                <View style={[styles.colorSwatch, { backgroundColor: organization?.color_scheme?.accent || colors.warning[500] }]} />
                <Text style={styles.colorSwatchLabel}>Accent</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Account Settings */}
        <Card variant="elevated" style={styles.settingsCard}>
          <Text style={styles.sectionTitle}>Account</Text>
          <SettingItem
            icon="person-outline"
            label="Edit Profile"
            iconColor={colors.primary[600]}
            onPress={() => Alert.alert('Coming Soon', 'Profile editing will be available soon.')}
          />
          <SettingItem
            icon="notifications-outline"
            label="Notification Preferences"
            iconColor={colors.info[600]}
            onPress={() => Alert.alert('Coming Soon', 'Notification preferences will be available soon.')}
          />
          <SettingItem
            icon="lock-closed-outline"
            label="Change Password"
            iconColor={colors.warning[600]}
            onPress={() => Alert.alert('Coming Soon', 'Password change will be available soon.')}
          />
        </Card>

        {/* App Settings */}
        <Card variant="elevated" style={styles.settingsCard}>
          <Text style={styles.sectionTitle}>App</Text>
          <SettingItem
            icon="moon-outline"
            label="Dark Mode"
            value="Off"
            iconColor={colors.gray[600]}
            onPress={() => Alert.alert('Coming Soon', 'Dark mode will be available soon.')}
          />
          <SettingItem
            icon="language-outline"
            label="Language"
            value="English"
            iconColor={colors.success[600]}
            onPress={() => Alert.alert('Coming Soon', 'Language settings will be available soon.')}
          />
        </Card>

        {/* Support */}
        <Card variant="elevated" style={styles.settingsCard}>
          <Text style={styles.sectionTitle}>Support</Text>
          <SettingItem
            icon="help-circle-outline"
            label="Help Center"
            iconColor={colors.info[600]}
            onPress={() => Alert.alert('Help Center', 'Contact support for assistance.')}
          />
          <SettingItem
            icon="document-text-outline"
            label="Terms of Service"
            iconColor={colors.gray[600]}
            onPress={() => Alert.alert('Terms', 'Terms of Service content.')}
          />
          <SettingItem
            icon="shield-outline"
            label="Privacy Policy"
            iconColor={colors.gray[600]}
            onPress={() => Alert.alert('Privacy', 'Privacy Policy content.')}
          />
        </Card>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>{config.APP_NAME}</Text>
          <Text style={styles.appInfoVersion}>Version {config.APP_VERSION}</Text>
          <Text style={styles.appInfoMock}>
            {config.USE_MOCK ? 'Running with Mock Data' : 'Connected to API'}
          </Text>
        </View>

        {/* Logout Button */}
        <Button
          label="Sign Out"
          variant="danger"
          icon="log-out-outline"
          onPress={handleLogout}
          loading={isLoading}
          fullWidth
          style={styles.logoutButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
    color: colors.text.primary,
  },
  profileCard: {
    marginBottom: spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: spacing.lg,
  },
  profileName: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.text.primary,
  },
  profileRole: {
    fontSize: fontSizes.sm,
    color: colors.primary[600],
    fontWeight: fontWeights.medium,
    marginTop: 2,
  },
  profileEmail: {
    fontSize: fontSizes.sm,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    marginTop: spacing.lg,
  },
  adminBadgeText: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    color: colors.primary[700],
  },
  orgCard: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.lg,
  },
  orgHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  orgLogoContainer: {
    marginRight: spacing.md,
  },
  orgLogo: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
  },
  orgLogoPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orgLogoText: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
    color: colors.white,
  },
  orgInfo: {
    flex: 1,
  },
  orgName: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.text.primary,
  },
  orgStatus: {
    fontSize: fontSizes.sm,
    color: colors.success[600],
    marginTop: 2,
  },
  colorScheme: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  colorSchemeLabel: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  colorSwatches: {
    flexDirection: 'row',
    gap: spacing.xl,
  },
  colorSwatchItem: {
    alignItems: 'center',
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xs,
    ...cardShadow,
  },
  colorSwatchLabel: {
    fontSize: fontSizes.xs,
    color: colors.text.tertiary,
  },
  settingsCard: {
    marginBottom: spacing.lg,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  settingLabel: {
    fontSize: fontSizes.base,
    color: colors.text.primary,
    fontWeight: fontWeights.medium,
  },
  settingItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  settingValue: {
    fontSize: fontSizes.sm,
    color: colors.text.tertiary,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  appInfoText: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.text.secondary,
  },
  appInfoVersion: {
    fontSize: fontSizes.xs,
    color: colors.text.muted,
    marginTop: 2,
  },
  appInfoMock: {
    fontSize: fontSizes.xs,
    color: colors.primary[500],
    marginTop: spacing.xs,
  },
  logoutButton: {
    marginBottom: spacing['3xl'],
  },
});

export default SettingsScreen;
