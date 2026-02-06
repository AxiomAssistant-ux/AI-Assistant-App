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
import { useFollowupsStore } from '../stores';
import { getActionItemDueDate, isActionItemOverdue } from '../lib/dateUtils';
import {
    Card,
    CardSkeleton,
    EmptyState,
    UrgencyChip,
    StatusChip,
    FilterChip,
} from '../components';
import { ActionItem, ActionItemStatus } from '../lib/types';
import { colors, spacing, fontSizes, fontWeights, borderRadius } from '../theme';

const statusOptions: { value: ActionItemStatus | undefined; label: string }[] = [
    { value: undefined, label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
];

const FollowupCard: React.FC<{
    item: ActionItem;
    onPress: () => void;
}> = ({ item, onPress }) => {
    const isUrgent =
        (item.urgency === 'high' || item.urgency === 'critical') &&
        item.status !== 'completed';

    const isOverdue = isActionItemOverdue(item);
    const dueDate = getActionItemDueDate(item);
    const formattedDueDate = dueDate ? dueDate.toLocaleDateString() : 'Not set';

    return (
        <Card
            variant="elevated"
            onPress={onPress}
            style={[styles.card, isUrgent && styles.cardUrgent]}
        >
            <View style={styles.cardHeader}>
                <View style={styles.typeContainer}>
                    <Ionicons
                        name="call-outline"
                        size={16}
                        color={colors.primary[500]}
                    />
                    <Text style={styles.typeText}>Follow-up</Text>
                </View>
                <UrgencyChip level={item.urgency} size="sm" />
            </View>

            <Text style={styles.cardTitle} numberOfLines={1}>
                {item.title}
            </Text>
            <Text style={styles.cardDescription} numberOfLines={2}>
                {item.description}
            </Text>

            <View style={styles.cardFooter}>
                <StatusChip status={item.status} size="sm" />
                <View style={[styles.dueInfo, isOverdue && styles.dueInfoOverdue]}>
                    <Ionicons
                        name="time-outline"
                        size={14}
                        color={isOverdue ? colors.error[500] : colors.gray[400]}
                    />
                    <Text style={[styles.dueText, isOverdue && styles.dueTextOverdue]}>
                        {isOverdue ? 'Overdue' : `Due ${formattedDueDate}`}
                    </Text>
                </View>
            </View>
        </Card>
    );
};

export const FollowupsListScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const {
        followups,
        isLoading,
        isRefreshing,
        isLoadingMore,
        hasMore,
        statusFilter,
        fetchFollowups,
        refreshFollowups,
        loadMoreFollowups,
        setStatusFilter,
    } = useFollowupsStore();

    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchFollowups(true);
    }, []);

    const handleRefresh = useCallback(() => {
        refreshFollowups();
    }, []);

    const handleLoadMore = useCallback(() => {
        if (hasMore && !isLoadingMore) {
            loadMoreFollowups();
        }
    }, [hasMore, isLoadingMore]);

    const handleItemPress = (item: ActionItem) => {
        navigation.navigate('FollowupDetail', { id: item._id });
    };

    const renderItem = ({ item }: { item: ActionItem }) => (
        <FollowupCard item={item} onPress={() => handleItemPress(item)} />
    );

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.titleRow}>
                <Text style={styles.title}>Follow-ups</Text>
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
                                    selected={statusFilter === option.value}
                                    onPress={() => setStatusFilter(option.value)}
                                />
                            ))}
                        </View>
                    </ScrollView>
                </View>
            )}
        </View>
    );

    const renderSkeleton = () => (
        <View style={styles.skeletonContainer}>
            {[1, 2, 3, 4].map((i) => (
                <CardSkeleton key={i} style={styles.skeletonCard} />
            ))}
        </View>
    );

    if (isLoading && followups.length === 0) {
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
                data={followups}
                keyExtractor={(item) => item._id}
                renderItem={renderItem}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={
                    <EmptyState
                        icon="call-outline"
                        title="No follow-ups found"
                        description="There are no follow-up tasks assigned to your store."
                        actionLabel="Clear filters"
                        onAction={() => setStatusFilter(undefined)}
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
    typeText: {
        fontSize: fontSizes.xs,
        fontWeight: fontWeights.bold,
        color: colors.primary[600],
        textTransform: 'uppercase',
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
    skeletonContainer: {
        padding: spacing.lg,
    },
    skeletonCard: {
        marginBottom: spacing.md,
    },
});

export default FollowupsListScreen;
