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
import { useComplaintsStore } from '../stores';
import {
  Card,
  CardSkeleton,
  EmptyState,
  UrgencyChip,
  StatusChip,
  FilterChip,
  Avatar,
} from '../components';
import { Complaint, ComplaintStatus, SeverityLevel } from '../lib/types';
import { colors, spacing, fontSizes, fontWeights, borderRadius } from '../theme';

const statusOptions: { value: ComplaintStatus | undefined; label: string }[] = [
  { value: undefined, label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
];

const severityOptions: { value: SeverityLevel | undefined; label: string }[] = [
  { value: undefined, label: 'All Severity' },
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const ComplaintCard: React.FC<{
  complaint: Complaint;
  onPress: () => void;
}> = ({ complaint, onPress }) => {
  const isUrgent =
    (complaint.complaint_severity === 'high' || complaint.complaint_severity === 'critical') &&
    (complaint.status === 'pending' || complaint.status === 'in_progress');

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
        <UrgencyChip level={complaint.complaint_severity} type="severity" size="sm" />
        <StatusChip status={complaint.status} size="sm" />
      </View>

      <Text style={styles.cardTitle} numberOfLines={1}>
        {complaint.complaint_type}
      </Text>
      <Text style={styles.cardDescription} numberOfLines={2}>
        {complaint.complaint_description}
      </Text>

      <View style={styles.cardMeta}>
        <View style={styles.customerInfo}>
          <Avatar name={complaint.customer.name} size="xs" />
          <View style={styles.customerDetails}>
            <Text style={styles.customerName} numberOfLines={1}>
              {complaint.customer.name}
            </Text>
            <Text style={styles.customerPhone}>{complaint.customer.phone}</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.storeInfo}>
          <Ionicons name="storefront-outline" size={14} color={colors.gray[400]} />
          <Text style={styles.storeName} numberOfLines={1}>
            {complaint.store.name}
          </Text>
        </View>
        <Text style={styles.timeAgo}>{getTimeAgo(complaint.created_at)}</Text>
      </View>
    </Card>
  );
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

export const ComplaintsListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const {
    complaints,
    isLoading,
    isRefreshing,
    isLoadingMore,
    hasMore,
    filters,
    fetchComplaints,
    refreshComplaints,
    loadMoreComplaints,
    setFilters,
  } = useComplaintsStore();

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchComplaints(true);
  }, []);

  const handleRefresh = useCallback(() => {
    refreshComplaints();
  }, []);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoadingMore) {
      loadMoreComplaints();
    }
  }, [hasMore, isLoadingMore]);

  const handleComplaintPress = (complaint: Complaint) => {
    navigation.navigate('ComplaintDetail', { id: complaint._id });
  };

  const handleStatusFilter = (status: ComplaintStatus | undefined) => {
    setFilters({ ...filters, status });
  };

  const handleSeverityFilter = (severity: SeverityLevel | undefined) => {
    setFilters({ ...filters, severity });
  };

  const renderItem = ({ item }: { item: Complaint }) => (
    <ComplaintCard complaint={item} onPress={() => handleComplaintPress(item)} />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>Complaints</Text>
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
                  onPress={() => handleStatusFilter(option.value)}
                />
              ))}
            </View>
          </ScrollView>

          <Text style={[styles.filterLabel, { marginTop: spacing.md }]}>Severity</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterRow}>
              {severityOptions.map((option) => (
                <FilterChip
                  key={option.label}
                  label={option.label}
                  selected={filters.severity === option.value}
                  onPress={() => handleSeverityFilter(option.value)}
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

  if (isLoading && complaints.length === 0) {
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
        data={complaints}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <EmptyState
            icon="chatbubbles-outline"
            title="No complaints found"
            description="There are no complaints matching your filters."
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
    marginBottom: spacing.md,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    color: colors.text.primary,
  },
  customerPhone: {
    fontSize: fontSizes.xs,
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
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  storeName: {
    fontSize: fontSizes.sm,
    color: colors.text.tertiary,
    flex: 1,
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

export default ComplaintsListScreen;
