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
import { useUrgentStore, useAuthStore } from '../stores';
import {
  Card,
  CardSkeleton,
  EmptyState,
  UrgencyChip,
  StatusChip,
  Badge,
  Avatar,
} from '../components';
import { UrgentItem, Complaint, ActionItem, ComplaintWithActions } from '../lib/types';
import { colors, spacing, fontSizes, fontWeights, borderRadius } from '../theme';

const UrgentItemCard: React.FC<{
  item: UrgentItem;
  onPress: () => void;
}> = ({ item, onPress }) => {
  const data = item.item as ComplaintWithActions;
  const { complaint, action_items_count, urgent_count } = data;

  return (
    <Card variant="elevated" onPress={onPress} style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.typeIndicator}>
          <Ionicons name="chatbubble-ellipses" size={14} color={colors.error[500]} />
          <Text style={styles.typeLabel}>Complaint</Text>
        </View>
        <UrgencyChip level={complaint.complaint_severity} type="severity" size="sm" />
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
          <Text style={styles.customerName} numberOfLines={1}>
            {complaint.customer.name}
          </Text>
        </View>
        <StatusChip status={complaint.status} size="sm" />
      </View>

      {action_items_count > 0 && (
        <View style={styles.tasksSummary}>
          <View style={styles.taskLabelContainer}>
            <Ionicons name="list" size={14} color={colors.primary[600]} />
            <Text style={styles.taskCountText}>
              {action_items_count} Task{action_items_count !== 1 ? 's' : ''}
              {urgent_count > 0 ? ` (${urgent_count} Urgent)` : ''}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.cardFooter}>
        <View style={styles.storeInfo}>
          <Ionicons name="storefront-outline" size={14} color={colors.gray[400]} />
          <Text style={styles.storeName} numberOfLines={1}>
            {complaint.store.name}
          </Text>
        </View>
        <Text style={styles.timeAgo}>
          {getTimeAgo(complaint.created_at)}
        </Text>
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

const formatDueDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 0) return 'Overdue';
  if (diffHours < 1) return 'Soon';
  if (diffHours < 24) return `in ${diffHours}h`;
  return date.toLocaleDateString();
};

const formatActionType = (type: string): string => {
  return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

export const UrgentScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user, organization } = useAuthStore();
  const {
    isLoading,
    isRefreshing,
    error,
    getUrgentItems,
    getUrgentCount,
    fetchUrgent,
    refreshUrgent,
  } = useUrgentStore();

  const urgentItems = getUrgentItems();
  const urgentCount = getUrgentCount();

  useEffect(() => {
    fetchUrgent();
  }, []);

  const handleRefresh = useCallback(() => {
    refreshUrgent();
  }, []);

  const handleItemPress = (item: UrgentItem) => {
    const data = item.item as ComplaintWithActions;
    navigation.navigate('ComplaintDetail', {
      id: data.complaint._id,
      initialData: data
    });
  };

  const renderItem = ({ item }: { item: UrgentItem }) => (
    <UrgentItemCard item={item} onPress={() => handleItemPress(item)} />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.greeting}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.userName}>{user?.name?.split(' ')[0] || 'User'}</Text>
      </View>
      <View style={styles.urgentCounter}>
        <View style={styles.counterBadge}>
          <Ionicons name="alert-circle" size={18} color={colors.white} />
          <Text style={styles.counterText}>{urgentCount}</Text>
        </View>
        <Text style={styles.counterLabel}>Urgent</Text>
      </View>
    </View>
  );

  const renderSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3].map((i) => (
        <CardSkeleton key={i} style={styles.skeletonCard} />
      ))}
    </View>
  );

  if (isLoading && urgentItems.length === 0) {
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
        data={urgentItems}
        keyExtractor={(item) => `urgent_${(item.item as any).complaint._id}`}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <EmptyState
            icon="checkmark-circle-outline"
            title="All caught up!"
            description="No urgent items require your attention right now."
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.xs,
  },
  greeting: {
    flex: 1,
  },
  welcomeText: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
  },
  userName: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
    color: colors.text.primary,
  },
  urgentCounter: {
    alignItems: 'center',
  },
  counterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error[500],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  counterText: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.white,
  },
  counterLabel: {
    fontSize: fontSizes.xs,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  card: {
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  typeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  typeLabel: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.medium,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  customerName: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    color: colors.text.primary,
    flex: 1,
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
  dueInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dueText: {
    fontSize: fontSizes.sm,
    color: colors.text.tertiary,
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
  tasksSummary: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  taskLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  taskCountText: {
    fontSize: fontSizes.xs,
    color: colors.primary[700],
    fontWeight: fontWeights.medium,
  },
});

export default UrgentScreen;
