import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    KeyboardAvoidingView,
    Platform,
    Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useFollowupsStore, useComplaintsStore, showSuccess, showError } from '../stores';
import { getActionItemDueDate, formatDueDateDisplay } from '../lib/dateUtils';
import {
    Header,
    Card,
    UrgencyChip,
    StatusChip,
    DetailSkeleton,
    Button,
    TextArea,
    ActionButton,
} from '../components';
import { colors, spacing, fontSizes, fontWeights, borderRadius } from '../theme';

export const FollowupDetailScreen: React.FC = () => {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { id } = route.params;

    const {
        selectedFollowup: followup,
        isLoadingDetail,
        fetchFollowup,
        resolveFollowup,
        clearSelectedFollowup,
    } = useFollowupsStore();

    const {
        selectedComplaint: associatedComplaint,
        scanCall,
        clearSelectedComplaint,
    } = useComplaintsStore();

    const [notes, setNotes] = useState('');
    const [isResolving, setIsResolving] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            await fetchFollowup(id);
        };
        loadData();
        return () => {
            clearSelectedFollowup();
            clearSelectedComplaint();
        };
    }, [id]);

    useEffect(() => {
        if (followup?.call_id) {
            scanCall(followup.call_id);
        }
    }, [followup?.call_id]);

    const handleCall = () => {
        const phone = associatedComplaint?.complaint?.customer?.phone;
        if (phone) {
            const phoneNumber = phone.replace(/[^0-9+]/g, '');
            Linking.openURL(`tel:${phoneNumber}`);
        } else {
            showError('Customer phone number not available');
        }
    };

    const handleRefresh = () => {
        fetchFollowup(id);
    };

    const handleResolve = async () => {
        setIsResolving(true);
        try {
            await resolveFollowup(id, notes);
            showSuccess('Follow-up resolved');
            navigation.goBack();
        } catch (error) {
            showError('Failed to resolve follow-up');
        } finally {
            setIsResolving(false);
        }
    };

    const getDueDateDisplay = () => {
        if (!followup) return 'Not set';
        const dueDate = getActionItemDueDate(followup);
        return formatDueDateDisplay(dueDate);
    };

    if (isLoadingDetail || !followup) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <Header
                    title="Follow-up"
                    leftIcon="arrow-back"
                    onLeftPress={() => navigation.goBack()}
                />
                <DetailSkeleton />
            </SafeAreaView>
        );
    }

    const isResolved = followup.status === 'completed';

    return (
        <View style={styles.container}>
            <Header
                title="Follow-up"
                leftIcon="arrow-back"
                onLeftPress={() => navigation.goBack()}
                subtitle={followup.status ? followup.status.replace('_', ' ') : 'Detail'}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.flex}
            >
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
                    {/* Status & Urgency */}
                    <View style={styles.statusRow}>
                        <UrgencyChip level={followup.urgency} />
                        <StatusChip status={followup.status} />
                    </View>

                    {/* Resolution Info (if resolved) */}
                    {isResolved && (
                        <Card style={[styles.section, styles.resolvedCard]}>
                            <View style={styles.resolvedHeader}>
                                <Ionicons name="checkmark-circle" size={24} color={colors.success[500]} />
                                <Text style={styles.resolvedTitle}>Resolved</Text>
                            </View>
                            {/* {followup.resolved_at && (
                                <View style={styles.resolvedRow}>
                                    <Text style={styles.resolvedLabel}>Resolved at:</Text>
                                    <Text style={styles.resolvedValue}>
                                        {new Date(followup.resolved_at).toLocaleString()}
                                    </Text>
                                </View>
                            )} */}
                            {followup.resolution_notes && (
                                <View style={styles.resolvedNotes}>
                                    <Text style={styles.resolvedLabel}>Resolution Notes:</Text>
                                    <Text style={styles.resolvedNotesText}>{followup.resolution_notes}</Text>
                                </View>
                            )}
                        </Card>
                    )}

                    {/* Follow-up Details */}
                    <Card style={styles.section}>
                        <Text style={styles.sectionTitle}>Follow-up Task</Text>
                        <Text style={styles.title}>{followup.title}</Text>
                        <Text style={styles.description}>{followup.description}</Text>

                        <View style={styles.metaGrid}>
                            <View style={styles.metaItem}>
                                <Ionicons name="calendar-outline" size={16} color={colors.text.tertiary} />
                                <View>
                                    <Text style={styles.metaLabel}>Due Date</Text>
                                    <Text style={styles.metaValue}>
                                        {getDueDateDisplay()}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.metaItem}>
                                <Ionicons name="time-outline" size={16} color={colors.text.tertiary} />
                                <View>
                                    <Text style={styles.metaLabel}>Created</Text>
                                    <Text style={styles.metaValue}>
                                        {new Date(followup.created_at).toLocaleDateString()}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </Card>

                    {/* Quick Actions - Only show if not resolved */}
                    {!isResolved && (
                        <Card style={styles.section}>
                            <Text style={styles.sectionTitle}>Actions</Text>
                            <Text style={styles.actionHint}>
                                Take action on this follow-up to move it forward.
                            </Text>

                            <View style={styles.resolveContainer}>
                                <ActionButton
                                    label="Call Customer"
                                    icon="call-outline"
                                    variant="call"
                                    onPress={handleCall}
                                    style={styles.actionButton}
                                />
                                <TextArea
                                    placeholder="Add resolution notes (optional)..."
                                    value={notes}
                                    onChangeText={setNotes}
                                    rows={4}
                                />
                                <Button
                                    label="Mark as Resolved"
                                    icon="checkmark-circle-outline"
                                    onPress={handleResolve}
                                    loading={isResolving}
                                    disabled={isResolving}
                                    fullWidth
                                />
                            </View>
                        </Card>
                    )}

                    {/* Read-only message for resolved */}
                    {isResolved && (
                        <Card style={styles.section}>
                            <Text style={styles.sectionTitle}>Actions</Text>
                            <Text style={styles.readOnlyNote}>
                                This follow-up has been resolved. No further actions are available.
                            </Text>
                        </Card>
                    )}

                    {/* Timestamps */}
                    <View style={styles.timestamps}>
                        <Text style={styles.timestamp}>
                            Created: {new Date(followup.created_at).toLocaleString()}
                        </Text>
                        <Text style={styles.timestamp}>
                            Updated: {new Date(followup.updated_at).toLocaleString()}
                        </Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.secondary,
    },
    flex: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: spacing.lg,
    },
    statusRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: spacing.lg,
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
        marginBottom: spacing.lg,
    },
    resolvedCard: {
        backgroundColor: colors.success[50],
        borderWidth: 1,
        borderColor: colors.success[100],
    },
    resolvedHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    resolvedTitle: {
        fontSize: fontSizes.lg,
        fontWeight: fontWeights.semibold,
        color: colors.success[700],
    },
    resolvedRow: {
        flexDirection: 'row',
        marginBottom: spacing.sm,
    },
    resolvedLabel: {
        fontSize: fontSizes.sm,
        color: colors.text.secondary,
        width: 110,
    },
    resolvedValue: {
        fontSize: fontSizes.sm,
        fontWeight: fontWeights.medium,
        color: colors.text.primary,
        flex: 1,
    },
    resolvedNotes: {
        marginTop: spacing.sm,
    },
    resolvedNotesText: {
        fontSize: fontSizes.sm,
        color: colors.text.secondary,
        marginTop: spacing.xs,
        lineHeight: fontSizes.sm * 1.5,
    },
    metaGrid: {
        flexDirection: 'row',
        gap: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.border.light,
        paddingTop: spacing.md,
    },
    metaItem: {
        flex: 1,
        flexDirection: 'row',
        gap: spacing.sm,
        alignItems: 'flex-start',
    },
    metaLabel: {
        fontSize: fontSizes.xs,
        color: colors.text.muted,
        marginBottom: 2,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    metaValue: {
        fontSize: fontSizes.sm,
        fontWeight: fontWeights.medium,
        color: colors.text.primary,
    },
    actionHint: {
        fontSize: fontSizes.sm,
        color: colors.text.secondary,
        marginBottom: spacing.lg,
    },
    actionButton: {
        marginBottom: spacing.sm,
    },
    resolveContainer: {
        gap: spacing.md,
    },
    readOnlyNote: {
        fontSize: fontSizes.sm,
        color: colors.text.muted,
        fontStyle: 'italic',
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

export default FollowupDetailScreen;