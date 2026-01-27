import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useActionItemsStore, useUrgentStore, showSuccess, showError } from '../stores';
import {
  Header,
  Card,
  DetailSkeleton,
  UrgencyChip,
  StatusChip,
  Badge,
  ActionButton,
  UrgentBanner,
} from '../components';
import { ActionItemStatus, ActionItemType } from '../lib/types';
import { colors, spacing, fontSizes, fontWeights, borderRadius } from '../theme';

type RouteParams = {
  ActionItemDetail: { id: string };
};

const typeIcons: Record<ActionItemType, string> = {
  appointment: 'calendar',
  order: 'cart',
  incident: 'alert-circle',
  follow_up: 'call',
  task: 'checkbox',
};

const formatType = (type: string): string => {
  return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

export const ActionItemDetailScreen: React.FC = () => {
  const route = useRoute<RouteProp<RouteParams, 'ActionItemDetail'>>();
  const navigation = useNavigation();
  const { id } = route.params;

  const {
    selectedActionItem: item,
    isLoadingDetail,
    fetchActionItem,
    updateActionItemStatus,
    assignActionItemToMe,
    clearSelectedActionItem,
  } = useActionItemsStore();

  const { updateActionItemOptimistic } = useUrgentStore();

  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  useEffect(() => {
    fetchActionItem(id);
    return () => clearSelectedActionItem();
  }, [id]);

  const handleRefresh = useCallback(() => {
    fetchActionItem(id);
  }, [id]);

  const handleAssign = async () => {
    setLoadingAction('assign');
    try {
      const updated = await assignActionItemToMe(id);
      updateActionItemOptimistic(updated);
      showSuccess('Task assigned to you');
    } catch (error) {
      showError('Failed to assign task');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleStatusChange = async (status: ActionItemStatus) => {
    setLoadingAction(status);
    try {
      const updated = await updateActionItemStatus(id, status);
      updateActionItemOptimistic(updated);
      showSuccess(`Status updated to ${status.replace('_', ' ')}`);
    } catch (error) {
      showError('Failed to update status');
    } finally {
      setLoadingAction(null);
    }
  };

  if (isLoadingDetail || !item) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header
          title="Task"
          leftIcon="arrow-back"
          onLeftPress={() => navigation.goBack()}
        />
        <DetailSkeleton />
      </SafeAreaView>
    );
  }

  const isUrgent =
    (item.urgency === 'high' || item.urgency === 'critical') &&
    (item.status === 'pending' || item.status === 'in_progress');

  const isOverdue = new Date(item.due_at) < new Date() && item.status !== 'completed' && item.status !== 'dismissed';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="Task"
        leftIcon="arrow-back"
        onLeftPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={handleRefresh}
            tintColor={colors.primary[500]}
          />
        }
      >
        {isUrgent && (
          <UrgentBanner
            level={item.urgency}
            message="This task requires immediate attention"
          />
        )}

        {isOverdue && (
          <View style={styles.overdueBanner}>
            <Ionicons name="warning" size={18} color={colors.error[600]} />
            <Text style={styles.overdueText}>This task is overdue</Text>
          </View>
        )}

        {/* Type & Status Row */}
        <View style={styles.statusRow}>
          <View style={styles.typeContainer}>
            <Ionicons
              name={typeIcons[item.type] as any}
              size={20}
              color={colors.primary[500]}
            />
            <Badge label={formatType(item.type)} variant="primary" />
          </View>
          <View style={styles.statusContainer}>
            <UrgencyChip level={item.urgency} />
            <StatusChip status={item.status} />
          </View>
        </View>

        {/* Title & Description */}
        <Card style={styles.section}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </Card>

        {/* Details Card */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="time-outline" size={20} color={colors.gray[400]} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Due Date</Text>
              <Text style={[styles.detailValue, isOverdue && styles.overdueValue]}>
                {new Date(item.due_at).toLocaleString()}
                {isOverdue && ' (Overdue)'}
              </Text>
            </View>
          </View>

          {item.assigned_role && (
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="people-outline" size={20} color={colors.gray[400]} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Assigned Role</Text>
                <Text style={styles.detailValue}>{item.assigned_role}</Text>
              </View>
            </View>
          )}

          {item.assigned_to_user_id && (
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="person-outline" size={20} color={colors.gray[400]} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Assigned To</Text>
                <Text style={styles.detailValue}>Assigned User</Text>
              </View>
            </View>
          )}

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="call-outline" size={20} color={colors.gray[400]} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Call ID</Text>
              <Text style={styles.detailValue}>{item.call_id}</Text>
            </View>
          </View>
        </Card>

        {/* Quick Actions */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <View style={styles.actionsGrid}>
            <ActionButton
              label="Assign to Me"
              icon="person-add-outline"
              variant="assign"
              onPress={handleAssign}
              loading={loadingAction === 'assign'}
              disabled={!!loadingAction && loadingAction !== 'assign'}
              style={styles.actionButton}
            />
          </View>

          <View style={styles.actionsGrid}>
            {item.status === 'pending' && (
              <ActionButton
                label="Mark In Progress"
                icon="play-circle-outline"
                variant="progress"
                onPress={() => handleStatusChange('in_progress')}
                loading={loadingAction === 'in_progress'}
                disabled={!!loadingAction && loadingAction !== 'in_progress'}
                style={styles.actionButton}
              />
            )}
            {(item.status === 'pending' || item.status === 'in_progress') && (
              <ActionButton
                label="Complete"
                icon="checkmark-circle-outline"
                variant="resolve"
                onPress={() => handleStatusChange('completed')}
                loading={loadingAction === 'completed'}
                disabled={!!loadingAction && loadingAction !== 'completed'}
                style={styles.actionButton}
              />
            )}
          </View>

          {(item.status === 'pending' || item.status === 'in_progress') && (
            <View style={styles.actionsGrid}>
              <ActionButton
                label="Dismiss"
                icon="close-circle-outline"
                variant="default"
                onPress={() => handleStatusChange('dismissed')}
                loading={loadingAction === 'dismissed'}
                disabled={!!loadingAction && loadingAction !== 'dismissed'}
                style={styles.actionButton}
              />
            </View>
          )}
        </Card>

        {/* Timestamps */}
        <View style={styles.timestamps}>
          <Text style={styles.timestamp}>
            Created: {new Date(item.created_at).toLocaleString()}
          </Text>
          <Text style={styles.timestamp}>
            Updated: {new Date(item.updated_at).toLocaleString()}
          </Text>
        </View>
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
  overdueBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.error[50],
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.error[100],
    marginBottom: spacing.md,
  },
  overdueText: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    color: colors.error[700],
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: fontSizes.base,
    color: colors.text.secondary,
    lineHeight: fontSizes.base * 1.6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  detailIcon: {
    width: 36,
    alignItems: 'center',
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: fontSizes.xs,
    color: colors.text.tertiary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: fontSizes.base,
    color: colors.text.primary,
    fontWeight: fontWeights.medium,
  },
  overdueValue: {
    color: colors.error[600],
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  timestamps: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  timestamp: {
    fontSize: fontSizes.xs,
    color: colors.text.muted,
    marginBottom: spacing.xs,
  },
});

export default ActionItemDetailScreen;
