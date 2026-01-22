import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useNotificationsStore } from '../stores';
import { Card, CardSkeleton, EmptyState, Button } from '../components';
import { Notification } from '../lib/types';
import { colors, spacing, fontSizes, fontWeights, borderRadius } from '../theme';

const notificationIcons: Record<string, { name: string; color: string; bg: string }> = {
  urgent_complaint: {
    name: 'alert-circle',
    color: colors.error[600],
    bg: colors.error[50],
  },
  urgent_action: {
    name: 'flash',
    color: colors.warning[600],
    bg: colors.warning[50],
  },
  assignment: {
    name: 'person-add',
    color: colors.primary[600],
    bg: colors.primary[50],
  },
  status_change: {
    name: 'checkmark-circle',
    color: colors.success[600],
    bg: colors.success[50],
  },
  reminder: {
    name: 'time',
    color: colors.info[600],
    bg: colors.info[50],
  },
};

const NotificationItem: React.FC<{
  notification: Notification;
  onPress: () => void;
}> = ({ notification, onPress }) => {
  const iconConfig = notificationIcons[notification.type] || notificationIcons.reminder;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.notificationItem,
        !notification.read && styles.notificationUnread,
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: iconConfig.bg }]}>
        <Ionicons name={iconConfig.name as any} size={20} color={iconConfig.color} />
      </View>

      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationTitle} numberOfLines={1}>
            {notification.title}
          </Text>
          {!notification.read && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.notificationBody} numberOfLines={2}>
          {notification.body}
        </Text>
        <Text style={styles.notificationTime}>
          {formatNotificationTime(notification.created_at)}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={18} color={colors.gray[400]} />
    </TouchableOpacity>
  );
};

const formatNotificationTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

export const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const {
    notifications,
    isLoading,
    isRefreshing,
    getUnreadCount,
    fetchNotifications,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotificationsStore();

  const unreadCount = getUnreadCount();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleRefresh = useCallback(() => {
    refreshNotifications();
  }, []);

  const handleNotificationPress = async (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      markAsRead(notification._id);
    }

    // Navigate to the relevant screen
    if (notification.data.entity_type === 'complaint') {
      navigation.navigate('ComplaintDetail', { id: notification.data.entity_id });
    } else {
      navigation.navigate('ActionItemDetail', { id: notification.data.entity_id });
    }
  };

  const renderItem = ({ item }: { item: Notification }) => (
    <NotificationItem
      notification={item}
      onPress={() => handleNotificationPress(item)}
    />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <View>
          <Text style={styles.title}>Notifications</Text>
          {unreadCount > 0 && (
            <Text style={styles.unreadCountText}>
              {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
            </Text>
          )}
        </View>
        {unreadCount > 0 && (
          <Button
            label="Mark all read"
            variant="ghost"
            size="sm"
            onPress={markAllAsRead}
          />
        )}
      </View>
    </View>
  );

  const renderSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3, 4, 5].map((i) => (
        <View key={i} style={styles.skeletonItem}>
          <View style={styles.skeletonIcon} />
          <View style={styles.skeletonContent}>
            <View style={styles.skeletonTitle} />
            <View style={styles.skeletonBody} />
            <View style={styles.skeletonTime} />
          </View>
        </View>
      ))}
    </View>
  );

  if (isLoading && notifications.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        {renderHeader()}
        {renderSkeleton()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <EmptyState
            icon="notifications-off-outline"
            title="No notifications"
            description="You're all caught up! New notifications will appear here."
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary[500]}
            colors={[colors.primary[500]]}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  listContent: {
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
  header: {
    marginBottom: spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
    color: colors.text.primary,
  },
  unreadCountText: {
    fontSize: fontSizes.sm,
    color: colors.primary[600],
    marginTop: spacing.xs,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  notificationUnread: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[200],
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  notificationContent: {
    flex: 1,
    marginRight: spacing.sm,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  notificationTitle: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    color: colors.text.primary,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary[500],
    marginLeft: spacing.sm,
  },
  notificationBody: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
    lineHeight: fontSizes.sm * 1.4,
    marginBottom: spacing.xs,
  },
  notificationTime: {
    fontSize: fontSizes.xs,
    color: colors.text.muted,
  },
  skeletonContainer: {
    padding: spacing.lg,
  },
  skeletonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  skeletonIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.gray[200],
    marginRight: spacing.md,
  },
  skeletonContent: {
    flex: 1,
  },
  skeletonTitle: {
    width: '60%',
    height: 16,
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  skeletonBody: {
    width: '90%',
    height: 12,
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  skeletonTime: {
    width: '30%',
    height: 10,
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.sm,
  },
});

export default NotificationsScreen;
