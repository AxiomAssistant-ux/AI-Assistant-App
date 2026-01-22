import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useActionItemsStore } from '../stores';
import {
  Card,
  CardSkeleton,
  EmptyState,
  UrgencyChip,
  StatusChip,
  FilterChip,
  Badge,
} from '../components';
import { ActionItem, ActionItemStatus, UrgencyLevel, ActionItemType } from '../lib/types';
import { colors, spacing, fontSizes, fontWeights, borderRadius } from '../theme';

const statusOptions: { value: ActionItemStatus | undefined; label: string }[] = [
  { value: undefined, label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'dismissed', label: 'Dismissed' },
];

const urgencyOptions: { value: UrgencyLevel | undefined; label: string }[] = [
  { value: undefined, label: 'All Urgency' },
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const typeOptions: { value: ActionItemType | undefined; label: string }[] = [
  { value: undefined, label: 'All Types' },
  { value: 'appointment', label: 'Appointment' },
  { value: 'order', label: 'Order' },
  { value: 'incident', label: 'Incident' },
  { value: 'follow_up', label: 'Follow Up' },
  { value: 'task', label: 'Task' },
];

const typeIcons: Record<ActionItemType, string> = {
  appointment: 'calendar-outline',
  order: 'cart-outline',
  incident: 'alert-circle-outline',
  follow_up: 'call-outline',
  task: 'checkbox-outline',
};

const ActionItemCard: React.FC<{
  item: ActionItem;
  onPress: () => void;
}> = ({ item, onPress }) => {
  const isUrgent =
    (item.urgency === 'high' || item.urgency === 'critical') &&
    (item.status === 'pending' || item.status === 'in_progress');

  const isOverdue = new Date(item.due_at) < new Date() && item.status !== 'completed' && item.status !== 'dismissed';

  return (
    <Card
      variant="elevated"
      onPress={onPress}
      style={[styles.card, isUrgent && styles.cardUrgent]}
    >
      {isUrgent && (
        <View style={styles.urgentBanner}>
          <Ionicons name="alert-circle" size={12} color={colors.white} />
          <Text style={styles.urgentBannerText}>Urgent</Text>
        </View>
      )}

      <View style={styles.cardHeader}>
        <View style={styles.typeContainer}>
          <Ionicons
            name={typeIcons[item.type] as any}
            size={16}
            color={colors.primary[500]}
          />
          <Badge
            label={formatType(item.type)}
            variant="primary"
            size="sm"
          />
        </View>
        <UrgencyChip level={item.urgency} size="sm" />
      </View>

      <Text style={styles.cardTitle} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={styles.cardDescription} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.cardMeta}>
        <StatusChip status={item.status} size="sm" />
        {item.assigned_role && (
          <View style={styles.assignedInfo}>
            <Ionicons name="person-outline" size={14} color={colors.gray[400]} />
            <Text style={styles.assignedRole}>{item.assigned_role}</Text>
          </View>
        )}
      </View>

      <View style={styles.cardFooter}>
        <View style={[styles.dueInfo, isOverdue && styles.dueInfoOverdue]}>
          <Ionicons
            name="time-outline"
            size={14}
            color={isOverdue ? colors.error[500] : colors.gray[400]}
          />
          <Text style={[styles.dueText, isOverdue && styles.dueTextOverdue]}>
            {isOverdue ? 'Overdue' : `Due ${formatDueDate(item.due_at)}`}
          </Text>
        </View>
        <Text style={styles.timeAgo}>{getTimeAgo(item.created_at)}</Text>
      </View>
    </Card>
  );
};

const formatType = (type: string): string => {
  return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

const formatDueDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 0) return 'Overdue';
  if (diffHours < 1) return 'Soon';
  if (diffHours < 24) return `in ${diffHours}h`;
  if (diffDays === 1) return 'Tomorrow';
  return date.toLocaleDateString();
};

const getTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

export const ActionItemsListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const {
    actionItems,
    isLoading,
    isRefreshing,
    isLoadingMore,
    hasMore,
    filters,
    fetchActionItems,
    refreshActionItems,
    loadMoreActionItems,
    setFilters,
  } = useActionItemsStore();

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchActionItems(true);
  }, []);

  const handleRefresh = useCallback(() => {
    refreshActionItems();
  }, []);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoadingMore) {
      loadMoreActionItems();
    }
  }, [hasMore, isLoadingMore]);

  const handleItemPress = (item: ActionItem) => {
    navigation.navigate('ActionItemDetail', { id: item._id });
  };

  const renderItem = ({ item }: { item: ActionItem }) => (
    <ActionItemCard item={item} onPress={() => handleItemPress(item)} />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>Tasks</Text>
        <TouchableOpacity
          style={styles.filterToggle}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons
            name="filter"
            size={20}
            color={showFilters ? colors.primary[600] : colors.gray[500]}
          />
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={styles.filtersContainer}>
          <Text style={styles.filterLabel}>Status</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterRow}>
              {statusOptions.map((option) => (
                <FilterChip
                  key={option.label}
                  label={option.label}
                  selected={filters.status === option.value}
                  onPress={() => setFilters({ ...filters, status: option.value })}
                />
              ))}
            </View>
          </ScrollView>

          <Text style={[styles.filterLabel, { marginTop: spacing.md }]}>Urgency</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterRow}>
              {urgencyOptions.map((option) => (
                <FilterChip
                  key={option.label}
                  label={option.label}
                  selected={filters.urgency === option.value}
                  onPress={() => setFilters({ ...filters, urgency: option.value })}
                />
              ))}
            </View>
          </ScrollView>

          <Text style={[styles.filterLabel, { marginTop: spacing.md }]}>Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterRow}>
              {typeOptions.map((option) => (
                <FilterChip
                  key={option.label}
                  label={option.label}
                  selected={filters.type === option.value}
                  onPress={() => setFilters({ ...filters, type: option.value })}
                />
              ))}
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.loadingMore}>
        <CardSkeleton />
      </View>
    );
  };

  const renderSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3, 4].map((i) => (
        <CardSkeleton key={i} style={styles.skeletonCard} />
      ))}
    </View>
  );

  if (isLoading && actionItems.length === 0) {
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
        data={actionItems}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <EmptyState
            icon="checkbox-outline"
            title="No tasks found"
            description="There are no action items matching your filters."
            actionLabel="Clear filters"
            onAction={() => setFilters({})}
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
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
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
    color: colors.text.primary,
  },
  filterToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  filtersContainer: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  filterLabel: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  card: {
    marginBottom: spacing.md,
  },
  cardUrgent: {
    borderLeftWidth: 4,
    borderLeftColor: colors.error[500],
  },
  urgentBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error[500],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  urgentBannerText: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold,
    color: colors.white,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cardTitle: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  cardDescription: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
    lineHeight: fontSizes.sm * 1.5,
    marginBottom: spacing.md,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  assignedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  assignedRole: {
    fontSize: fontSizes.sm,
    color: colors.text.tertiary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  dueInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dueInfoOverdue: {
    backgroundColor: colors.error[50],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  dueText: {
    fontSize: fontSizes.sm,
    color: colors.text.tertiary,
  },
  dueTextOverdue: {
    color: colors.error[600],
    fontWeight: fontWeights.medium,
  },
  timeAgo: {
    fontSize: fontSizes.xs,
    color: colors.text.muted,
  },
  skeletonContainer: {
    padding: spacing.lg,
  },
  skeletonCard: {
    marginBottom: spacing.md,
  },
  loadingMore: {
    paddingVertical: spacing.lg,
  },
});

export default ActionItemsListScreen;
