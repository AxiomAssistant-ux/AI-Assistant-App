import React, { useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useHomeStore, useAuthStore, useUrgentStore, useNotificationsStore } from '../stores';
import { Card, CardSkeleton, StatusChip, UrgencyChip } from '../components';
import { ComplaintWithActions, UrgentItem } from '../lib/types';
import { colors, spacing, fontSizes, fontWeights, borderRadius } from '../theme';
import { cardShadow } from '../theme/shadows';

// Constants
const MAX_URGENT_ITEMS_DISPLAY = 5;
const GREETING_HOURS = {
  MORNING: 12,
  AFTERNOON: 17,
} as const;

const TIME_THRESHOLDS = {
  MINUTE: 60000,
  HOUR: 3600000,
  DAY: 86400000,
} as const;

// Utility functions (memoized outside component)
const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < GREETING_HOURS.MORNING) return 'Good morning';
  if (hour < GREETING_HOURS.AFTERNOON) return 'Good afternoon';
  return 'Good evening';
};

const getTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  if (diffMs < TIME_THRESHOLDS.MINUTE) return 'Just now';

  const diffMins = Math.floor(diffMs / TIME_THRESHOLDS.MINUTE);
  if (diffMins < 60) return `${diffMins} min ago`;

  const diffHours = Math.floor(diffMs / TIME_THRESHOLDS.HOUR);
  if (diffHours < 24) return `${diffHours}h ago`;

  return `${Math.floor(diffHours / 24)}d ago`;
};

const formatDate = (): string => {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  };
  return now.toLocaleDateString('en-US', options);
};

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  // Store selectors - optimized to prevent unnecessary re-renders
  const user = useAuthStore(state => state.user);
  const {
    stats,
    isLoading,
    isRefreshing,
    fetchDashboard,
    refreshDashboard,
  } = useHomeStore();

  const {
    fetchUrgent,
    refreshUrgent,
  } = useUrgentStore();

  // Optimized selectors - only subscribe to specific data
  const urgentItems = useUrgentStore(state => state.getUrgentItems());
  const urgentCount = useUrgentStore(state => state.getUrgentCount());

  const {
    getUnreadCount,
    fetchNotifications,
  } = useNotificationsStore();

  const unreadCount = getUnreadCount();

  // Memoized computed values
  const hasUrgentItems = useMemo(() => urgentCount > 0, [urgentCount]);

  const displayedUrgentItems = useMemo(
    () => urgentItems.slice(0, MAX_URGENT_ITEMS_DISPLAY),
    [urgentItems]
  );

  const pendingCount = useMemo(
    () => stats?.complaints.by_status.pending ?? 0,
    [stats?.complaints.by_status.pending]
  );

  // Initial data fetch
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await Promise.all([
          fetchDashboard(),
          fetchUrgent(),
          fetchNotifications(),
        ]);
      } catch (error) {
        console.error('Failed to load initial data:', error);
      }
    };

    loadInitialData();
  }, [fetchDashboard, fetchUrgent, fetchNotifications]);

  // Auto-refresh on screen focus
  useFocusEffect(
    useCallback(() => {
      const refreshData = async () => {
        try {
          await Promise.all([
            refreshDashboard(),
            refreshUrgent(),
            fetchNotifications(),
          ]);
        } catch (error) {
          console.error('Failed to refresh data:', error);
        }
      };

      refreshData();
    }, [refreshDashboard, refreshUrgent, fetchNotifications])
  );

  // Optimized handlers with useCallback
  const handleRefresh = useCallback(async () => {
    try {
      await Promise.all([
        refreshDashboard(),
        refreshUrgent(),
      ]);
    } catch (error) {
      console.error('Failed to refresh:', error);
    }
  }, [refreshDashboard, refreshUrgent]);

  const handleViewAllComplaints = useCallback(() => {
    navigation.navigate('Complaints', { screen: 'ComplaintsList' });
  }, [navigation]);

  const handleViewAllTasks = useCallback(() => {
    navigation.navigate('Followups', { screen: 'FollowupsList' });
  }, [navigation]);

  const handleAnalytics = useCallback(() => {
    navigation.navigate('Analytics');
  }, [navigation]);

  const handleComplaintPress = useCallback((item: ComplaintWithActions) => {
    navigation.navigate('Complaints', {
      screen: 'ComplaintDetail',
      params: { id: item.complaint._id, initialData: item },
    });
  }, [navigation]);

  const handleNotificationsPress = useCallback(() => {
    navigation.navigate('Notifications');
  }, [navigation]);

  const handleSettingsPress = useCallback(() => {
    navigation.navigate('Settings');
  }, [navigation]);

  // Render functions - memoized with useCallback
  const renderHeader = useCallback(() => (
    <View style={styles.header}>
      <View>
        <View style={styles.storeTitleRow}>
          <Ionicons name="storefront-outline" size={18} color={colors.text.primary} />
          <Text style={styles.headerTitle}>
            {stats?.store_info.store_name || 'Store'}
          </Text>
        </View>

        <Text style={styles.headerSubtitle}>
          {getGreeting()} • {user?.name || 'Manager'}
        </Text>
      </View>

      <View style={styles.headerRight}>
        <TouchableOpacity
          onPress={handleNotificationsPress}
          activeOpacity={0.7}
          accessibilityLabel="Notifications"
          accessibilityHint={unreadCount > 0 ? `${unreadCount} unread notifications` : undefined}
        >
          <View style={styles.notificationIcon}>
            <Ionicons name="notifications-outline" size={22} color="#000" />
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSettingsPress}
          activeOpacity={0.7}
          accessibilityLabel="Settings"
        >
          <Ionicons name="settings-outline" size={22} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  ), [stats?.store_info.store_name, user?.name, urgentCount, handleNotificationsPress, handleSettingsPress]);

  const renderStatusSummary = useCallback(() => {
    if (!hasUrgentItems) return null;

    return (
      <View style={styles.urgentBanner}>
        <View>
          <Text style={styles.urgentTitle}>
            URGENT: {urgentCount} Active Complaint{urgentCount !== 1 ? 's' : ''}
          </Text>
          <Text style={styles.urgentSubtitle}>
            {urgentCount} complaint{urgentCount !== 1 ? 's' : ''} require immediate action
          </Text>
        </View>

        <TouchableOpacity
          style={styles.urgentButton}
          onPress={handleViewAllComplaints}
          activeOpacity={0.7}
          accessibilityLabel={`View all ${urgentCount} urgent complaints`}
        >
          <Text style={styles.urgentButtonText}>
            View All Complaints
          </Text>
        </TouchableOpacity>
      </View>
    );
  }, [hasUrgentItems, urgentCount, handleViewAllComplaints]);

  const renderQuickActions = useCallback(() => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActionsRow}>
        <TouchableOpacity
          style={styles.quickAction}
          onPress={handleViewAllComplaints}
          activeOpacity={0.7}
          accessibilityLabel="View complaints"
          accessibilityHint={pendingCount > 0 ? `${pendingCount} pending complaints` : undefined}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: colors.warning[50] }]}>
            <Ionicons name="chatbubble-ellipses" size={24} color={colors.warning[500]} />
          </View>
          <Text style={styles.quickActionLabel}>View Complaints</Text>
          {pendingCount > 0 && (
            <View style={styles.quickActionBadge}>
              <Text style={styles.quickActionBadgeText}>{pendingCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickAction}
          onPress={handleViewAllTasks}
          activeOpacity={0.7}
          accessibilityLabel="Follow-ups"
        >
          <View style={[styles.quickActionIcon, { backgroundColor: colors.info[50] }]}>
            <Ionicons name="checkbox" size={24} color={colors.info[500]} />
          </View>
          <Text style={styles.quickActionLabel}>Follow-ups</Text>
          {stats && stats.pending_followups > 0 && (
            <View style={[styles.quickActionBadge, { backgroundColor: colors.info[500] }]}>
              <Text style={styles.quickActionBadgeText}>{stats.pending_followups}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickAction}
          onPress={handleAnalytics}
          activeOpacity={0.7}
          accessibilityLabel="Analytics"
        >
          <View style={[styles.quickActionIcon, { backgroundColor: colors.primary[50] }]}>
            <Ionicons name="stats-chart" size={24} color={colors.primary[500]} />
          </View>
          <Text style={styles.quickActionLabel}>Analytics</Text>
        </TouchableOpacity>
      </View>
    </View>
  ), [pendingCount, handleViewAllComplaints, handleViewAllTasks, handleAnalytics]);

  const renderUrgentItem = useCallback((item: UrgentItem) => {
    const data = item.item as ComplaintWithActions;
    const { complaint, action_items_count } = data;

    return (
      <TouchableOpacity
        key={complaint._id}
        style={styles.urgentItem}
        onPress={() => handleComplaintPress(data)}
        activeOpacity={0.7}
        accessibilityLabel={`Urgent complaint: ${complaint.complaint_type}`}
        accessibilityHint={`${action_items_count} tasks, created ${getTimeAgo(complaint.created_at)}`}
      >
        <View style={styles.urgentItemIcon}>
          <Ionicons name="chatbubble-ellipses" size={20} color={colors.error[500]} />
        </View>
        <View style={styles.urgentItemContent}>
          <View style={styles.urgentItemHeader}>
            <Text style={styles.urgentItemType} numberOfLines={1}>
              {complaint.complaint_type}
            </Text>
            <UrgencyChip level={complaint.complaint_severity} type="severity" size="sm" />
          </View>
          <Text style={styles.urgentItemCustomer} numberOfLines={1}>
            {complaint.customer.name} • {action_items_count} task{action_items_count !== 1 ? 's' : ''}
          </Text>
          <View style={styles.urgentItemFooter}>
            <StatusChip status={complaint.status} size="sm" />
            <Text style={styles.urgentItemTime}>{getTimeAgo(complaint.created_at)}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
      </TouchableOpacity>
    );
  }, [handleComplaintPress]);

  const renderUrgentList = useCallback(() => {
    if (!hasUrgentItems) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="alert-circle" size={20} color={colors.error[500]} />
            <Text style={styles.sectionTitle}>Needs Your Attention</Text>
          </View>
          <TouchableOpacity onPress={handleViewAllComplaints}>
            <Text style={styles.viewAllLink}>View All</Text>
          </TouchableOpacity>
        </View>

        <Card style={styles.urgentCard}>
          {displayedUrgentItems.map(renderUrgentItem)}
        </Card>
      </View>
    );
  }, [hasUrgentItems, displayedUrgentItems, renderUrgentItem, handleViewAllComplaints]);

  const renderTodayStats = useCallback(() => {
    const totalComplaints = stats?.complaints.total ?? 0;
    const resolvedComplaints = stats?.complaints.by_status.resolved ?? 0;
    const pendingComplaints = stats?.complaints.by_status.pending ?? 0;
    const slaPercentage = stats?.sla_percentage ?? 0;
    const todayCalls = stats?.today_calls ?? 0;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Summary</Text>
          <Text style={styles.dateText}>{formatDate()}</Text>
        </View>

        <Card style={styles.statsCard}>
          {/* Main Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statBlock}>
              <Text style={styles.statNumber}>
                {totalComplaints}
              </Text>
              <Text style={styles.statLabel}>Total Cases</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statBlock}>
              <Text style={[styles.statNumber, styles.resolvedStatNumber]}>
                {resolvedComplaints}
              </Text>
              <Text style={styles.statLabel}>Resolved</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statBlock}>
              <Text style={[styles.statNumber, styles.pendingStatNumber]}>
                {pendingComplaints}
              </Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.horizontalDivider} />

          {/* Bottom Info Row */}
          <View style={styles.bottomInfoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="call-outline" size={16} color={colors.info[600]} />
              <Text style={styles.infoText}>
                {todayCalls} call{todayCalls !== 1 ? 's' : ''} today
              </Text>
            </View>

            <View style={styles.infoDivider} />

            <View style={styles.infoItem}>
              <Ionicons name="bar-chart" size={16} color={colors.success[600]} />
              <Text style={styles.infoText}>
                {slaPercentage}% within SLA
              </Text>
            </View>
          </View>
        </Card>
      </View>
    );
  }, [stats]);

  const renderAllCaughtUp = useCallback(() => {
    if (hasUrgentItems) return null;

    return (
      <View style={styles.section}>
        <Card style={styles.caughtUpCard}>
          <View style={styles.caughtUpIconContainer}>
            <Ionicons name="checkmark-circle" size={48} color={colors.success[500]} />
          </View>
          <Text style={styles.caughtUpTitle}>All caught up!</Text>
          <Text style={styles.caughtUpDescription}>
            No urgent items need your attention right now. Keep up the great work!
          </Text>
        </Card>
      </View>
    );
  }, [hasUrgentItems]);

  const renderRecentActivity = useCallback(() => {
    if (hasUrgentItems) return null;

    const recentStats = [
      {
        icon: 'trending-up',
        label: 'Resolution Rate',
        value: `${stats?.sla_percentage ?? 0}%`,
        color: colors.success[500],
        bgColor: colors.success[50],
      },
      {
        icon: 'time-outline',
        label: 'Avg Response Time',
        value: stats?.avg_response_time ?? '--',
        color: colors.info[500],
        bgColor: colors.info[50],
      },
      {
        icon: 'people-outline',
        label: 'Customer Satisfaction',
        value: stats?.customer_satisfaction ?? '--',
        color: colors.warning[500],
        bgColor: colors.warning[50],
      },
    ];

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance Insights</Text>
        <View style={styles.insightsGrid}>
          {recentStats.map((stat, index) => (
            <Card key={index} style={styles.insightCard}>
              <View style={[styles.insightIcon, { backgroundColor: stat.bgColor }]}>
                <Ionicons name={stat.icon as any} size={20} color={stat.color} />
              </View>
              <Text style={styles.insightValue}>{stat.value}</Text>
              <Text style={styles.insightLabel}>{stat.label}</Text>
            </Card>
          ))}
        </View>
      </View>
    );
  }, [hasUrgentItems, stats?.sla_percentage]);

  const renderSkeleton = useCallback(() => (
    <View style={styles.skeletonContainer}>
      <View style={styles.skeletonHeader}>
        <View style={styles.skeletonTextLarge} />
        <View style={styles.skeletonTextSmall} />
      </View>
      <CardSkeleton style={styles.skeletonCard} />
      <View style={styles.skeletonRow}>
        <CardSkeleton style={styles.skeletonSmallCard} />
        <CardSkeleton style={styles.skeletonSmallCard} />
        <CardSkeleton style={styles.skeletonSmallCard} />
      </View>
      <CardSkeleton style={styles.skeletonCard} />
    </View>
  ), []);

  // Loading state
  if (isLoading && !stats) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {renderHeader()}
          {renderSkeleton()}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Main render
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary[500]}
            colors={[colors.primary[500]]}
          />
        }
      >
        {renderHeader()}
        {renderStatusSummary()}
        {renderTodayStats()}
        {renderQuickActions()}
        {renderUrgentList()}
        {renderAllCaughtUp()}
        {renderRecentActivity()}
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
  scrollContent: {
    padding: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  storeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.text.primary,
  },
  headerSubtitle: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  notificationIcon: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: colors.error[500],
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: fontWeights.bold,
  },
  urgentBanner: {
    backgroundColor: colors.error[600],
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  urgentTitle: {
    color: colors.white,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    marginBottom: 4,
  },
  urgentSubtitle: {
    color: colors.error[100],
    fontSize: fontSizes.sm,
  },
  urgentButton: {
    backgroundColor: colors.white,
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    alignItems: 'center',
  },
  urgentButtonText: {
    color: colors.error[600],
    fontWeight: fontWeights.semibold,
    fontSize: fontSizes.sm,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.text.primary,
  },
  dateText: {
    fontSize: fontSizes.sm,
    color: colors.text.muted,
  },
  viewAllLink: {
    fontSize: fontSizes.sm,
    color: colors.primary[600],
    fontWeight: fontWeights.medium,
  },
  statsCard: {
    padding: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statBlock: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: fontWeights.bold,
    color: colors.text.primary,
  },
  resolvedStatNumber: {
    color: colors.success[600],
  },
  pendingStatNumber: {
    color: colors.warning[600],
  },
  statLabel: {
    fontSize: fontSizes.sm,
    color: colors.text.muted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border.light,
    marginHorizontal: spacing.sm,
  },
  horizontalDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border.light,
    marginVertical: spacing.md,
  },
  bottomInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
    justifyContent: 'center',
  },
  infoText: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
  },
  infoDivider: {
    width: 1,
    height: 16,
    backgroundColor: colors.border.light,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  quickAction: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    position: 'relative',
    ...cardShadow,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  quickActionLabel: {
    fontSize: fontSizes.xs,
    color: colors.text.secondary,
    fontWeight: fontWeights.medium,
    textAlign: 'center',
  },
  quickActionBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.warning[500],
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    minWidth: 20,
    alignItems: 'center',
  },
  quickActionBadgeText: {
    fontSize: fontSizes.xs,
    color: colors.white,
    fontWeight: fontWeights.bold,
  },
  urgentCard: {
    padding: 0,
    overflow: 'hidden',
  },
  urgentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border.light,
  },
  urgentItemIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.error[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  urgentItemContent: {
    flex: 1,
    marginRight: spacing.sm,
  },
  urgentItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  urgentItemType: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.text.primary,
    flex: 1,
    marginRight: spacing.sm,
  },
  urgentItemCustomer: {
    fontSize: fontSizes.xs,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  urgentItemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  urgentItemTime: {
    fontSize: fontSizes.xs,
    color: colors.text.muted,
  },
  caughtUpCard: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  caughtUpIconContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: colors.success[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  caughtUpTitle: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  caughtUpDescription: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: fontSizes.sm * 1.5,
  },
  insightsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  insightCard: {
    flex: 1,
    padding: spacing.md,
    alignItems: 'center',
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  insightValue: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  insightLabel: {
    fontSize: fontSizes.xs,
    color: colors.text.muted,
    textAlign: 'center',
  },
  skeletonContainer: {
    gap: spacing.lg,
  },
  skeletonHeader: {
    marginBottom: spacing.md,
  },
  skeletonTextLarge: {
    width: 150,
    height: 28,
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  skeletonTextSmall: {
    width: 100,
    height: 16,
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.sm,
  },
  skeletonCard: {
    height: 100,
  },
  skeletonRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  skeletonSmallCard: {
    flex: 1,
    height: 100,
  },
});

export default HomeScreen;