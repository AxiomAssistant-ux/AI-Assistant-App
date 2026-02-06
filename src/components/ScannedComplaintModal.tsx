import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    ScrollView,
    TouchableOpacity,
    Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ComplaintWithActions } from '../lib/types';
import { colors, spacing, fontSizes, fontWeights, borderRadius } from '../theme';
import { UrgencyChip } from './UrgencyChip';
import { StatusChip } from './StatusChip';
import { Badge } from './Badge';
import { Avatar } from './Avatar';

interface ScannedComplaintModalProps {
    visible: boolean;
    data: ComplaintWithActions | null;
    onClose: () => void;
    onViewDetails: () => void;
}

export const ScannedComplaintModal: React.FC<ScannedComplaintModalProps> = ({
    visible,
    data,
    onClose,
    onViewDetails,
}) => {
    if (!data) return null;

    const { complaint, action_items, urgent_count } = data;
    const hasUrgentTask = urgent_count > 0;
    const isUrgentComplaint =
        (complaint.complaint_severity === 'high' || complaint.complaint_severity === 'critical') &&
        (complaint.status === 'pending' || complaint.status === 'in_progress');

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <Pressable style={styles.backdrop} onPress={onClose}>
                <Pressable style={styles.container} onPress={(e) => e.stopPropagation()}>
                    {/* Header */}
                    <View style={[styles.header, (hasUrgentTask || isUrgentComplaint) && styles.headerUrgent]}>
                        <View style={styles.headerContent}>
                            <Ionicons
                                name="qr-code"
                                size={24}
                                color={hasUrgentTask || isUrgentComplaint ? colors.error[600] : colors.primary[600]}
                            />
                            <Text style={[styles.headerTitle, (hasUrgentTask || isUrgentComplaint) && styles.headerTitleUrgent]}>
                                Complaint Found
                            </Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={colors.gray[600]} />
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {/* Urgent Banner */}
                        {/* {(hasUrgentTask || isUrgentComplaint) && (
                            <View style={styles.urgentBanner}>
                                <Ionicons name="alert-circle" size={20} color={colors.error[700]} />
                                <Text style={styles.urgentBannerText}>
                                    {hasUrgentTask ? '⚠️ Contains Urgent Task' : '⚠️ Urgent Complaint'}
                                </Text>
                            </View>
                        )} */}

                        {/* Status Badges */}
                        {/* <View style={styles.badgeRow}>
                            <UrgencyChip level={complaint.complaint_severity} type="severity" size="md" />
                            <StatusChip status={complaint.status} size="md" />
                        </View> */}

                        {/* Customer Info */}
                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>Customer</Text>
                            <View style={styles.customerRow}>
                                <Avatar name={complaint.customer.name} size="md" />
                                <View style={styles.customerDetails}>
                                    <Text style={styles.customerName}>{complaint.customer.name}</Text>
                                    <View style={styles.contactRow}>
                                        <Ionicons name="call-outline" size={14} color={colors.text.tertiary} />
                                        <Text style={styles.contactText}>{complaint.customer.phone}</Text>
                                    </View>
                                    {complaint.customer.email && (
                                        <View style={styles.contactRow}>
                                            <Ionicons name="mail-outline" size={14} color={colors.text.tertiary} />
                                            <Text style={styles.contactText}>{complaint.customer.email}</Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        </View>

                        {/* Replacement Items Table */}
                        {action_items && action_items.filter(item => item.replacement_item).length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionLabel}>Replacement Items</Text>
                                <View style={styles.tableContainer}>
                                    <View style={styles.tableHeader}>
                                        <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Item</Text>
                                        <Text style={styles.tableHeaderCell}>Size</Text>
                                        <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Reason</Text>
                                    </View>
                                    {action_items
                                        .filter(item => item.replacement_item)
                                        .map((item) => (
                                            <View key={item._id} style={styles.tableRow}>
                                                <Text style={[styles.tableCell, { flex: 2 }]}>
                                                    {item.replacement_item!.item_name}
                                                </Text>
                                                <Text style={styles.tableCell}>
                                                    {item.replacement_item!.size}
                                                </Text>
                                                <Text style={[styles.tableCell, { flex: 2 }]} numberOfLines={2}>
                                                    {item.replacement_item!.reason}
                                                </Text>
                                            </View>
                                        ))}
                                </View>
                            </View>
                        )}

                        {/* Complaint Type & Description */}
                        {/* <View style={styles.section}>
                            <Text style={styles.complaintType}>{complaint.complaint_type}</Text>
                            <Text style={styles.description} numberOfLines={3}>
                                {complaint.complaint_description}
                            </Text>
                        </View> */}



                        {/* Store Info */}
                        {/* <View style={styles.section}>
                            <Text style={styles.sectionLabel}>Store</Text>
                            <View style={styles.storeRow}>
                                <Ionicons name="storefront" size={20} color={colors.primary[500]} />
                                <View style={styles.storeDetails}>
                                    <Text style={styles.storeName}>{complaint.store.name}</Text>
                                    <Text style={styles.storeAddress}>{complaint.store.address}</Text>
                                </View>
                            </View>
                        </View> */}

                        {/* Action Items */}
                        {action_items && action_items.length > 0 && (
                            <View style={[styles.section, styles.taskSection]}>
                                {/* <View style={styles.taskHeader}>
                                    <Ionicons
                                        name={hasUrgentTask ? "alert-circle" : "clipboard"}
                                        size={20}
                                        color={hasUrgentTask ? colors.error[600] : colors.primary[600]}
                                    />
                                    <Text style={[styles.sectionLabel, styles.taskLabel]}>
                                        {action_items.length === 1 ? 'Task' : `${action_items.length} Tasks`}
                                    </Text>
                                </View> */}
                                {action_items.map((item, index) => (
                                    <View
                                        key={item._id}
                                        style={[
                                            styles.taskCard,
                                            hasUrgentTask && (item.urgency === 'high' || item.urgency === 'critical') && styles.taskCardUrgent,
                                            index < action_items.length - 1 && styles.taskCardSpacing
                                        ]}
                                    >
                                        <View style={styles.taskBadgeRow}>
                                            {/* <Badge label={item.type.replace('_', ' ')} variant="primary" size="sm" />
                                            <UrgencyChip level={item.urgency} size="sm" /> */}
                                            <StatusChip status={item.status} size="sm" />
                                        </View>
                                        <Text style={styles.taskTitle}>
                                            {item.title}
                                        </Text>
                                        <Text style={styles.taskDescription} numberOfLines={2}>
                                            {item.description}
                                        </Text>
                                        <View style={styles.taskMetaRow}>
                                            <Ionicons name="calendar-outline" size={14} color={colors.text.tertiary} />
                                            <Text style={styles.taskMetaText}>
                                                Due: {new Date(item.due_at).toLocaleDateString()}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Timestamp */}
                        <View style={styles.timestampRow}>
                            <Ionicons name="time-outline" size={14} color={colors.text.muted} />
                            <Text style={styles.timestamp}>
                                Created {new Date(complaint.created_at).toLocaleString()}
                            </Text>
                        </View>
                    </ScrollView>

                    {/* Footer Actions */}
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[styles.button, styles.buttonSecondary]}
                            onPress={onClose}
                        >
                            <Text style={styles.buttonSecondaryText}>Close</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.buttonPrimary, (hasUrgentTask || isUrgentComplaint) && styles.buttonUrgent]}
                            onPress={onViewDetails}
                        >
                            <Text style={styles.buttonPrimaryText}>Details</Text>
                            <Ionicons name="arrow-forward" size={18} color={colors.white} />
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
    },
    container: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.xl,
        width: '100%',
        maxHeight: '85%',
        overflow: 'hidden',
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.light,
        backgroundColor: colors.primary[50],
    },
    headerUrgent: {
        backgroundColor: colors.error[50],
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        flex: 1,
    },
    headerTitle: {
        fontSize: fontSizes.xl,
        fontWeight: fontWeights.bold,
        color: colors.primary[700],
    },
    headerTitleUrgent: {
        color: colors.error[700],
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: spacing.lg,
    },
    urgentBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor: colors.error[100],
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginBottom: spacing.lg,
    },
    urgentBannerText: {
        fontSize: fontSizes.sm,
        fontWeight: fontWeights.bold,
        color: colors.error[700],
        flex: 1,
    },
    badgeRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: spacing.lg,
    },
    section: {
        marginBottom: spacing.lg,
    },
    sectionLabel: {
        fontSize: fontSizes.xs,
        fontWeight: fontWeights.semibold,
        color: colors.text.secondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: spacing.sm,
    },
    complaintType: {
        fontSize: fontSizes['2xl'],
        fontWeight: fontWeights.bold,
        color: colors.text.primary,
        marginBottom: spacing.sm,
    },
    description: {
        fontSize: fontSizes.base,
        color: colors.text.secondary,
        lineHeight: fontSizes.base * 1.6,
    },
    customerRow: {
        flexDirection: 'row',
        gap: spacing.md,
        alignItems: 'center',
    },
    customerDetails: {
        flex: 1,
    },
    customerName: {
        fontSize: fontSizes.lg,
        fontWeight: fontWeights.semibold,
        color: colors.text.primary,
        marginBottom: spacing.xs,
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginTop: spacing.xs,
    },
    contactText: {
        fontSize: fontSizes.sm,
        color: colors.text.secondary,
    },
    storeRow: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    storeDetails: {
        flex: 1,
    },
    storeName: {
        fontSize: fontSizes.md,
        fontWeight: fontWeights.semibold,
        color: colors.text.primary,
        marginBottom: spacing.xs,
    },
    storeAddress: {
        fontSize: fontSizes.sm,
        color: colors.text.secondary,
    },
    taskSection: {
        backgroundColor: colors.gray[50],
        // padding: spacing.md,
        borderRadius: borderRadius.lg,
    },
    taskHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    taskLabel: {
        marginBottom: 0,
    },
    taskCard: {
        backgroundColor: colors.white,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.border.light,
    },
    taskCardUrgent: {
        borderColor: colors.error[500],
        borderWidth: 2,
        color: colors.error[500],
    },
    taskCardSpacing: {
        marginBottom: spacing.md,
    },
    taskBadgeRow: {
        flexDirection: 'row',
        gap: spacing.xs,
        marginBottom: spacing.sm,
        flexWrap: 'wrap',
    },
    taskTitle: {
        fontSize: fontSizes.lg,
        fontWeight: fontWeights.bold,
        color: colors.text.primary,
        marginBottom: spacing.xs,
    },
    taskDescription: {
        fontSize: fontSizes.sm,
        color: colors.text.secondary,
        lineHeight: fontSizes.sm * 1.5,
        marginBottom: spacing.sm,
    },
    taskMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    taskMetaText: {
        fontSize: fontSizes.xs,
        color: colors.text.tertiary,
        fontWeight: fontWeights.medium,
    },
    timestampRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.border.light,
    },
    timestamp: {
        fontSize: fontSizes.xs,
        color: colors.text.muted,
    },
    footer: {
        flexDirection: 'row',
        gap: spacing.md,
        padding: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.border.light,
        backgroundColor: colors.gray[50],
    },
    button: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.lg,
        minHeight: 48,
    },
    buttonSecondary: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border.default,
    },
    buttonSecondaryText: {
        fontSize: fontSizes.base,
        fontWeight: fontWeights.semibold,
        color: colors.text.primary,
    },
    buttonPrimary: {
        backgroundColor: colors.primary[600],
    },
    buttonUrgent: {
        backgroundColor: colors.error[600],
    },
    buttonPrimaryText: {
        fontSize: fontSizes.base,
        fontWeight: fontWeights.semibold,
        color: colors.white,
    },
    tableContainer: {
        borderWidth: 1,
        borderColor: colors.border.light,
        borderRadius: borderRadius.md,
        overflow: 'hidden',
        backgroundColor: colors.white,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: colors.gray[100],
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.xs,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.default,
    },
    tableHeaderCell: {
        flex: 1,
        fontSize: fontSizes.xs,
        fontWeight: fontWeights.bold,
        color: colors.text.secondary,
        textTransform: 'uppercase',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.xs,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.light,
    },
    tableCell: {
        flex: 1,
        fontSize: fontSizes.sm,
        color: colors.text.primary,
    },
});