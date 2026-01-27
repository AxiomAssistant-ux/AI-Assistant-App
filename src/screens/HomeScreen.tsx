import React, { useEffect, useCallback } from 'react';
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
import { useHomeStore, useAuthStore, useUrgentStore } from '../stores';
import { Card, CardSkeleton, StatusChip, UrgencyChip, EmptyState } from '../components';
import { Complaint, ActionItem } from '../lib/types';
import { colors, spacing, fontSizes, fontWeights, borderRadius } from '../theme';
import { cardShadow } from '../theme/shadows';

// Get time-based greeting
const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

// Format relative time
const getTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
};

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const {
    stats,
    isLoading,
    isRefreshing,
    fetchDashboard,
    refreshDashboard,
  } = useHomeStore();
  const {
    complaints: urgentComplaints,
    actionItems: urgentActionItems,
    fetchUrgent,
    refreshUrgent,
  } = useUrgentStore();

  // Fetch on mount
  useEffect(() => {
    fetchDashboard();
    fetchUrgent();
  }, []);

  // Auto-refresh on focus
  useFocusEffect(
    useCallback(() => {
      refreshDashboard();
      refreshUrgent();
    }, [])
  );

  const handleRefresh = useCallback(() => {
    refreshDashboard();
    refreshUrgent();
  }, []);

  const handleScanQR = () => {
    navigation.navigate('QRScanner');
  };

  const handleViewAllComplaints = () => {
    navigation.navigate('Complaints', { screen: 'ComplaintsList' });
  };

  const handleViewAllTasks = () => {
    navigation.navigate('Actions', { screen: 'ActionItemsList' });
  };

  const handleComplaintPress = (complaint: Complaint) => {
    navigation.navigate('Complaints', {
      screen: 'ComplaintDetail',
      params: { id: complaint._id },
    });
  };

  const handleTaskPress = (task: ActionItem) => {
    navigation.navigate('Actions', {
      screen: 'ActionItemDetail',
      params: { id: task._id },
    });
  };

  const handleNotificationsPress = () => {
    navigation.navigate('Notifications');
  };

  const handleSettingsPress = () => {
    navigation.navigate('Settings');
  };

  // Calculate totals for summary
  const totalUrgentItems = urgentComplaints.length + urgentActionItems.length;
  const hasUrgentItems = totalUrgentItems > 0;

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={styles.greetingText}>{getGreeting()},</Text>
        <Text style={styles.userName}>{user?.name?.split(' ')[0] || 'Manager'}</Text>
        {stats && (
          <View style={styles.storeInfo}>
            <Ionicons name="storefront" size={14} color={colors.primary[500]} />
            <Text style={styles.storeName}>
              {stats.storeName} #{stats.storeNumber}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.headerRight}>
        <TouchableOpacity
          style={styles.headerIcon}
          onPress={handleNotificationsPress}
          activeOpacity={0.7}
        >
          <Ionicons name="notifications-outline" size={22} color={colors.text.secondary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerIcon}
          onPress={handleSettingsPress}
          activeOpacity={0.7}
        >
          <Ionicons name="settings-outline" size={22} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStatusSummary = () => {
    if (!hasUrgentItems) {
      return (
        <View style={styles.statusCard}>
          <View style={styles.statusIconContainer}>
            <Ionicons name="checkmark-circle" size={32} color={colors.success[500]} />
          </View>
          <View style={styles.statusContent}>
            <Text style={styles.statusTitle}>All caught up!</Text>
            <Text style={styles.statusDescription}>
              No urgent items need your attention right now.
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.statusCard, styles.statusCardUrgent]}>
        <View style={[styles.statusIconContainer, styles.statusIconUrgent]}>
          <Ionicons name="alert-circle" size={32} color={colors.error[500]} />
        </View>
        <View style={styles.statusContent}>
          <Text style={styles.statusTitle}>
            {totalUrgentItems} item{totalUrgentItems > 1 ? 's' : ''} need attention
          </Text>
          <Text style={styles.statusDescription}>
            {urgentComplaints.length > 0 && `${urgentComplaints.length} complaint${urgentComplaints.length > 1 ? 's' : ''}`}
            {urgentComplaints.length > 0 && urgentActionItems.length > 0 && ' and '}
            {urgentActionItems.length > 0 && `${urgentActionItems.length} task${urgentActionItems.length > 1 ? 's' : ''}`}
            {' '}require immediate action.
          </Text>
        </View>
      </View>
    );
  };

  const renderScanButton = () => (
    <TouchableOpacity
      style={styles.scanButton}
      onPress={handleScanQR}
      activeOpacity={0.8}
    >
      <View style={styles.scanIconContainer}>
        <Ionicons name="scan" size={32} color={colors.white} />
      </View>
      <View style={styles.scanTextContainer}>
        <Text style={styles.scanTitle}>Scan QR Code</Text>
        <Text style={styles.scanSubtitle}>Look up a complaint instantly</Text>
      </View>
      <View style={styles.scanArrow}>
        <Ionicons name="arrow-forward" size={20} color={colors.white} />
      </View>
    </TouchableOpacity>
  );

  const renderQuickActions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActionsRow}>
        <TouchableOpacity
          style={styles.quickAction}
          onPress={handleViewAllComplaints}
          activeOpacity={0.7}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: colors.warning[50] }]}>
            <Ionicons name="chatbubble-ellipses" size={24} color={colors.warning[500]} />
          </View>
          <Text style={styles.quickActionLabel}>View Complaints</Text>
          {(stats?.pendingComplaints ?? 0) > 0 && (
            <View style={styles.quickActionBadge}>
              <Text style={styles.quickActionBadgeText}>{stats?.pendingComplaints}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickAction}
          onPress={handleViewAllTasks}
          activeOpacity={0.7}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: colors.info[50] }]}>
            <Ionicons name="checkbox" size={24} color={colors.info[500]} />
          </View>
          <Text style={styles.quickActionLabel}>View Tasks</Text>
          {(stats?.urgentActionItems ?? 0) > 0 && (
            <View style={[styles.quickActionBadge, { backgroundColor: colors.error[500] }]}>
              <Text style={styles.quickActionBadgeText}>{stats?.urgentActionItems}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => navigation.navigate('Analytics')}
          activeOpacity={0.7}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: colors.primary[50] }]}>
            <Ionicons name="stats-chart" size={24} color={colors.primary[500]} />
          </View>
          <Text style={styles.quickActionLabel}>Analytics</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderUrgentComplaint = (complaint: Complaint) => (
    <TouchableOpacity
      key={complaint._id}
      style={styles.urgentItem}
      onPress={() => handleComplaintPress(complaint)}
      activeOpacity={0.7}
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
          {complaint.customer.name} - {complaint.store.name}
        </Text>
        <View style={styles.urgentItemFooter}>
          <StatusChip status={complaint.status} size="sm" />
          <Text style={styles.urgentItemTime}>{getTimeAgo(complaint.created_at)}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
    </TouchableOpacity>
  );

  const renderUrgentTask = (task: ActionItem) => {
    const isOverdue = new Date(task.due_at) < new Date() &&
      task.status !== 'completed' && task.status !== 'dismissed';

    return (
      <TouchableOpacity
        key={task._id}
        style={styles.urgentItem}
        onPress={() => handleTaskPress(task)}
        activeOpacity={0.7}
      >
        <View style={[styles.urgentItemIcon, isOverdue && styles.urgentItemIconOverdue]}>
          <Ionicons
            name={isOverdue ? 'time' : 'flash'}
            size={20}
            color={isOverdue ? colors.error[600] : colors.warning[500]}
          />
        </View>
        <View style={styles.urgentItemContent}>
          <View style={styles.urgentItemHeader}>
            <Text style={styles.urgentItemType} numberOfLines={1}>
              {task.title}
            </Text>
            <UrgencyChip level={task.urgency} size="sm" />
          </View>
          <Text style={styles.urgentItemCustomer} numberOfLines={1}>
            {task.description}
          </Text>
          <View style={styles.urgentItemFooter}>
            {isOverdue ? (
              <View style={styles.overdueTag}>
                <Text style={styles.overdueText}>Overdue</Text>
              </View>
            ) : (
              <StatusChip status={task.status} size="sm" />
            )}
            <Text style={styles.urgentItemTime}>{getTimeAgo(task.created_at)}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
      </TouchableOpacity>
    );
  };

  const renderUrgentList = () => {
    if (!hasUrgentItems) return null;

    // Combine and limit to 5 items
    const allUrgentItems = [
      ...urgentComplaints.map(c => ({ type: 'complaint' as const, item: c, date: c.created_at })),
      ...urgentActionItems.map(a => ({ type: 'task' as const, item: a, date: a.created_at })),
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="alert-circle" size={20} color={colors.error[500]} />
            <Text style={styles.sectionTitle}>Needs Your Attention</Text>
          </View>
          <TouchableOpacity onPress={handleViewAllTasks}>
            <Text style={styles.viewAllLink}>View All</Text>
          </TouchableOpacity>
        </View>

        <Card style={styles.urgentCard}>
          {allUrgentItems.map((item) => (
            item.type === 'complaint'
              ? renderUrgentComplaint(item.item as Complaint)
              : renderUrgentTask(item.item as ActionItem)
          ))}
        </Card>
      </View>
    );
  };

  const renderTodayStats = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Today's Summary</Text>
      <View style={styles.todayStatsCard}>
        <View style={styles.todayStat}>
          <View style={[styles.todayStatIcon, { backgroundColor: colors.info[50] }]}>
            <Ionicons name="call" size={20} color={colors.info[500]} />
          </View>
          <Text style={styles.todayStatValue}>{stats?.todaysCalls ?? 0}</Text>
          <Text style={styles.todayStatLabel}>Calls Today</Text>
        </View>

        <View style={styles.todayStatDivider} />

        <View style={styles.todayStat}>
          <View style={[styles.todayStatIcon, { backgroundColor: colors.success[50] }]}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success[500]} />
          </View>
          <Text style={styles.todayStatValue}>{stats?.complaintsResolvedToday ?? 0}</Text>
          <Text style={styles.todayStatLabel}>Resolved</Text>
        </View>

        <View style={styles.todayStatDivider} />

        <View style={styles.todayStat}>
          <View style={[styles.todayStatIcon, { backgroundColor: colors.warning[50] }]}>
            <Ionicons name="hourglass" size={20} color={colors.warning[500]} />
          </View>
          <Text style={styles.todayStatValue}>{stats?.pendingComplaints ?? 0}</Text>
          <Text style={styles.todayStatLabel}>Pending</Text>
        </View>
      </View>
    </View>
  );

  const renderSkeleton = () => (
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
  );

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
        {renderScanButton()}
        {renderTodayStats()}
        {renderQuickActions()}
        {renderUrgentList()}
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
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...cardShadow,
  },
  greetingText: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
  },
  userName: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  storeName: {
    fontSize: fontSizes.xs,
    color: colors.primary[700],
    fontWeight: fontWeights.medium,
  },
  // Status Summary
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success[50],
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.success[100],
  },
  statusCardUrgent: {
    backgroundColor: colors.error[50],
    borderColor: colors.error[100],
  },
  statusIconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.success[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  statusIconUrgent: {
    backgroundColor: colors.error[100],
  },
  statusContent: {
    flex: 1,
  },
  statusTitle: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  statusDescription: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
    lineHeight: fontSizes.sm * 1.4,
  },
  // Scan Button
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[600],
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.xl,
    ...cardShadow,
  },
  scanIconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  scanTextContainer: {
    flex: 1,
  },
  scanTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  scanSubtitle: {
    fontSize: fontSizes.sm,
    color: colors.primary[100],
  },
  scanArrow: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Sections
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
    marginBottom: spacing.xs,
  },
  viewAllLink: {
    fontSize: fontSizes.sm,
    color: colors.primary[600],
    fontWeight: fontWeights.medium,
  },
  // Quick Actions
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
  // Urgent List
  urgentCard: {
    padding: 0,
    overflow: 'hidden',
  },
  urgentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
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
  urgentItemIconOverdue: {
    backgroundColor: colors.error[100],
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
  overdueTag: {
    backgroundColor: colors.error[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  overdueText: {
    fontSize: fontSizes.xs,
    color: colors.error[700],
    fontWeight: fontWeights.semibold,
  },
  // Today Stats
  todayStatsCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...cardShadow,
  },
  todayStat: {
    flex: 1,
    alignItems: 'center',
  },
  todayStatIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  todayStatValue: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  todayStatLabel: {
    fontSize: fontSizes.xs,
    color: colors.text.muted,
    textAlign: 'center',
  },
  todayStatDivider: {
    width: 1,
    height: '100%',
    backgroundColor: colors.border.light,
    marginHorizontal: spacing.md,
  },
  // Skeleton
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
