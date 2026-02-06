import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Linking,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useComplaintsStore, useUrgentStore, showSuccess, showError } from '../stores';
import {
  Header,
  Card,
  DetailSkeleton,
  UrgencyChip,
  StatusChip,
  Button,
  ActionButton,
  Avatar,
  TextArea,
  UrgentBanner,
  Badge,
} from '../components';
import { ResolveComplaintModal, ResolveData } from '../components/ResolveComplaintModal';
import { ComplaintStatus, ComplaintWithActions, ActionItem } from '../lib/types';
import { colors, spacing, fontSizes, fontWeights, borderRadius } from '../theme';

type RouteParams = {
  ComplaintDetail: { id: string, initialData?: ComplaintWithActions };
};

export const ComplaintDetailScreen: React.FC = () => {
  const route = useRoute<RouteProp<RouteParams, 'ComplaintDetail'>>();
  const navigation = useNavigation<any>();
  const { id, initialData } = route.params || {};

  if (!id) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Error" leftIcon="arrow-back" onLeftPress={() => navigation.goBack()} />
        <View style={styles.centered}>
          <Text>Invalid Complaint ID</Text>
        </View>
      </SafeAreaView>
    );
  }

  const {
    selectedComplaint: data,
    isLoadingDetail,
    fetchComplaint,
    setSelectedComplaint,
    updateComplaintStatus,
    addNote,
    resolveComplaint,
    clearSelectedComplaint,
  } = useComplaintsStore();

  const { updateComplaintOptimistic } = useUrgentStore();

  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [isResolving, setIsResolving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setSelectedComplaint(initialData);
    } else {
      fetchComplaint(id);
    }
    return () => clearSelectedComplaint();
  }, [id, initialData]);

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // Fallback: If no history (e.g. from QR Scanner), go to list
      navigation.navigate('ComplaintsList');
    }
  };

  const handleRefresh = useCallback(() => {
    fetchComplaint(id);
  }, [id]);

  if (isLoadingDetail || !data) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header
          title="Complaint"
          leftIcon="arrow-back"
          onLeftPress={handleBack}
        />
        <DetailSkeleton />
      </SafeAreaView>
    );
  }

  const { complaint, action_items, call_summary } = data;

  const handleCall = () => {
    if (complaint.customer?.phone) {
      const phoneNumber = complaint.customer.phone.replace(/[^0-9+]/g, '');
      Linking.openURL(`tel:${phoneNumber}`);
    }
  };

  const handleStatusChange = async (status: ComplaintStatus) => {
    setLoadingAction(status);
    try {
      const updated = await updateComplaintStatus(id, status);
      fetchComplaint(id);
      showSuccess(`Status updated to ${status.replace('_', ' ')}`);
    } catch (error) {
      showError('Failed to update status');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleResolve = async (resolveData: ResolveData) => {
    setIsResolving(true);
    try {
      const updated = await resolveComplaint(id, {
        complaint_id: id,
        voucher_given: resolveData.compensation,
        resolution_notes: resolveData.resolutionNotes || '',
      });
      fetchComplaint(id);
      setShowResolveModal(false);
      showSuccess('Complaint resolved successfully');
    } catch (error) {
      showError('Failed to resolve complaint');
      throw error;
    } finally {
      setIsResolving(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;

    setIsAddingNote(true);
    try {
      await addNote(id, noteText.trim());
      setNoteText('');
      setShowNoteInput(false);
      showSuccess('Note added');
      fetchComplaint(id);
    } catch (error) {
      showError('Failed to add note');
    } finally {
      setIsAddingNote(false);
    }
  };

  const isUrgent =
    (complaint?.complaint_severity === 'high' || complaint?.complaint_severity === 'critical') &&
    (complaint?.status === 'pending' || complaint?.status === 'in_progress');

  const isResolved = complaint?.status === 'resolved';

  return (
    <View style={styles.container}>
      <Header
        title="Complaint"
        leftIcon="arrow-back"
        onLeftPress={handleBack}
        subtitle={complaint?.status ? complaint.status.replace('_', ' ') : 'Detail'}
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
          {isUrgent && (
            <UrgentBanner
              level={complaint?.complaint_severity || 'medium'}
              message="This complaint requires immediate attention"
            />
          )}

          {/* Status & Severity */}
          <View style={styles.statusRow}>
            {complaint?.complaint_severity && (
              <UrgencyChip level={complaint.complaint_severity} type="severity" />
            )}
            {complaint?.status && <StatusChip status={complaint.status} />}
          </View>

          {/* Resolution Info (if resolved) */}
          {isResolved && (
            <Card style={[styles.section, styles.resolvedCard]}>
              <View style={styles.resolvedHeader}>
                <Ionicons name="checkmark-circle" size={24} color={colors.success[500]} />
                <Text style={styles.resolvedTitle}>Resolved</Text>
              </View>
              {complaint.compensation && (
                <View style={styles.resolvedRow}>
                  <Text style={styles.resolvedLabel}>Compensation:</Text>
                  <Text style={styles.resolvedValue}>{complaint.compensation}</Text>
                </View>
              )}
              {complaint.resolved_by && (
                <View style={styles.resolvedRow}>
                  <Text style={styles.resolvedLabel}>Resolved by:</Text>
                  <Text style={styles.resolvedValue}>{complaint.resolved_by}</Text>
                </View>
              )}
              {complaint.resolved_at && (
                <View style={styles.resolvedRow}>
                  <Text style={styles.resolvedLabel}>Resolved at:</Text>
                  <Text style={styles.resolvedValue}>
                    {new Date(complaint.resolved_at).toLocaleString()}
                  </Text>
                </View>
              )}
              {complaint.resolution_notes && (
                <View style={styles.resolvedNotes}>
                  <Text style={styles.resolvedLabel}>Resolution Notes:</Text>
                  <Text style={styles.resolvedNotesText}>{complaint.resolution_notes}</Text>
                </View>
              )}
            </Card>
          )}

          {/* Call Summary Section */}
          {/* {call_summary && (
            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>Call Summary</Text>
              {call_summary.summaries?.short_summary && (
                <Text style={styles.summaryText}>{call_summary.summaries.short_summary}</Text>
              )}
              {call_summary.call_timing && (
                <View style={styles.callTimingRow}>
                  <Ionicons name="time-outline" size={14} color={colors.text.tertiary} />
                  <Text style={styles.timingText}>
                    Duration: {Math.floor(call_summary.call_timing.duration / 60)}m {call_summary.call_timing.duration % 60}s
                  </Text>
                </View>
              )}
              {call_summary.recording_link && (
                <Button
                  label="Listen to Recording"
                  variant="ghost"
                  size="sm"
                  icon="play-circle-outline"
                  onPress={() => Linking.openURL(call_summary.recording_link!)}
                  style={styles.recordingButton}
                />
              )}
            </Card>
          )} */}

          {/* Type & Description */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Complaint Details</Text>
            <Text style={styles.complaintType}>{complaint?.complaint_type || 'General'}</Text>
            <Text style={styles.description}>
              {complaint?.complaint_description || 'No description provided.'}
            </Text>
          </Card>

          {/* Associated Task - Highlighted */}
          {action_items && action_items.length > 0 && (
            <Card style={[styles.section, styles.taskCard]}>
              <View style={styles.taskHeader}>
                <Ionicons name="clipboard-outline" size={20} color={colors.primary[600]} />
                <Text style={styles.sectionTitle}>Task</Text>
              </View>
              {action_items.map((item) => (
                <View key={item._id} style={styles.taskContent}>
                  <View style={styles.taskTagRow}>
                    <Badge label={item.type.replace('_', ' ')} variant="primary" size="sm" />
                    <UrgencyChip level={item.urgency} size="sm" />
                    <StatusChip status={item.status} size="sm" />
                  </View>
                  <Text style={styles.taskTitle}>{item.title}</Text>
                  <Text style={styles.taskDesc}>{item.description}</Text>
                  <View style={styles.taskMeta}>
                    <View style={styles.taskMetaItem}>
                      <Ionicons name="calendar-outline" size={14} color={colors.text.tertiary} />
                      <Text style={styles.taskMetaText}>
                        Due: {new Date(item.due_at).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
              <Text style={styles.taskHint}>
                {isResolved
                  ? "✓ This task was automatically resolved with the complaint."
                  : "⚠️ Resolving this complaint will also resolve this task."}
              </Text>
            </Card>
          )}

          {/* Quick Actions - Moved below task */}
          {!isResolved && (
            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <Text style={styles.actionHint}>
                Take action on this complaint to move it forward.
              </Text>

              <View style={styles.actionsGrid}>
                <ActionButton
                  label="Call Customer"
                  icon="call-outline"
                  variant="call"
                  onPress={handleCall}
                  disabled={!!loadingAction}
                  style={styles.actionButton}
                />
              </View>

              <View style={styles.actionsGrid}>
                {complaint.status === 'pending' && (
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
                {(complaint.status === 'pending' || complaint.status === 'in_progress') && (
                  <ActionButton
                    label="Resolve"
                    icon="checkmark-circle-outline"
                    variant="resolve"
                    onPress={() => setShowResolveModal(true)}
                    disabled={!!loadingAction}
                    style={styles.actionButton}
                  />
                )}
              </View>
            </Card>
          )}



          {/* Customer Info */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Customer</Text>
            {complaint.customer ? (
              <View style={styles.customerRow}>
                <Avatar name={complaint.customer.name} size="lg" />
                <View style={styles.customerDetails}>
                  <Text style={styles.customerName}>{complaint.customer.name}</Text>
                  <Text style={styles.customerContact}>{complaint.customer.phone}</Text>
                  {complaint.customer.email && (
                    <Text style={styles.customerContact}>{complaint.customer.email}</Text>
                  )}
                </View>
              </View>
            ) : (
              <Text style={styles.noDataText}>No customer details available</Text>
            )}
            <Text style={{ borderBottomWidth: 1, borderColor: colors.border.light, marginBottom: spacing.md }}></Text>

            <Text style={styles.sectionTitle}>Store</Text>
            {complaint.store ? (
              <View style={styles.storeRow}>
                <Ionicons name="storefront" size={24} color={colors.primary[500]} />
                <View style={styles.storeDetails}>
                  <Text style={styles.storeName}>{complaint.store.name}</Text>
                  <Text style={styles.storeAddress}>{complaint.store.address}</Text>
                  {complaint.store.phone && (
                    <Text style={styles.storePhone}>{complaint.store.phone}</Text>
                  )}
                </View>
              </View>
            ) : (
              <Text style={styles.noDataText}>No store details available</Text>
            )}
          </Card>



          {/* Read-only actions for resolved complaints */}
          {isResolved && (
            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>Actions</Text>
              <View style={styles.actionsGrid}>
                <ActionButton
                  label="Call Customer"
                  icon="call-outline"
                  variant="call"
                  onPress={handleCall}
                  style={styles.actionButton}
                />
              </View>
              <Text style={styles.readOnlyNote}>
                This complaint is resolved. Status changes are no longer available.
              </Text>
            </Card>
          )}

          {/* Notes Section */}
          <Card style={styles.section}>
            <View style={styles.notesHeader}>
              <Text style={styles.sectionTitle}>Notes</Text>
              {!isResolved && (
                <Button
                  label={showNoteInput ? 'Cancel' : 'Add Note'}
                  variant={showNoteInput ? 'ghost' : 'outline'}
                  size="sm"
                  icon={showNoteInput ? 'close' : 'add'}
                  onPress={() => setShowNoteInput(!showNoteInput)}
                />
              )}
            </View>

            {showNoteInput && !isResolved && (
              <View style={styles.noteInputContainer}>
                <TextArea
                  placeholder="Enter your note..."
                  value={noteText}
                  onChangeText={setNoteText}
                  rows={3}
                />
                <Button
                  label="Add Note"
                  onPress={handleAddNote}
                  loading={isAddingNote}
                  disabled={!noteText.trim()}
                  fullWidth
                />
              </View>
            )}

            {(!complaint.notes || complaint.notes.length === 0) && !showNoteInput ? (
              <Text style={styles.noNotes}>No notes yet</Text>
            ) : (
              (complaint.notes || []).map((note) => (
                <View key={note._id} style={styles.noteItem}>
                  <View style={styles.noteHeader}>
                    <Avatar name={note.user_name} size="xs" />
                    <Text style={styles.noteAuthor}>{note.user_name}</Text>
                    <Text style={styles.noteTime}>{formatNoteTime(note.created_at)}</Text>
                  </View>
                  <Text style={styles.noteContent}>{note.content}</Text>
                </View>
              ))
            )}
          </Card>

          {/* Timestamps */}
          <View style={styles.timestamps}>
            <Text style={styles.timestamp}>
              Created: {new Date(complaint.created_at).toLocaleString()}
            </Text>
            <Text style={styles.timestamp}>
              Updated: {new Date(complaint.updated_at).toLocaleString()}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Resolve Modal */}
      <ResolveComplaintModal
        visible={showResolveModal}
        onClose={() => setShowResolveModal(false)}
        onResolve={handleResolve}
        isLoading={isResolving}
        complaintType={complaint.complaint_type}
      />
    </View>
  );
};

const formatNoteTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  complaintType: {
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
  readOnlyNote: {
    fontSize: fontSizes.sm,
    color: colors.text.muted,
    fontStyle: 'italic',
    marginTop: spacing.sm,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
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
  customerContact: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  storeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  storePhone: {
    fontSize: fontSizes.sm,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  actionHint: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  notesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  noteInputContainer: {
    marginBottom: spacing.lg,
  },
  noNotes: {
    fontSize: fontSizes.sm,
    color: colors.text.muted,
    fontStyle: 'italic',
  },
  noteItem: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  noteAuthor: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    color: colors.text.primary,
    flex: 1,
  },
  noteTime: {
    fontSize: fontSizes.xs,
    color: colors.text.muted,
  },
  noteContent: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
    lineHeight: fontSizes.sm * 1.5,
    paddingLeft: spacing['2xl'] + spacing.sm,
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
  summaryText: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
    lineHeight: fontSizes.sm * 1.5,
    marginBottom: spacing.sm,
  },
  callTimingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  timingText: {
    fontSize: fontSizes.xs,
    color: colors.text.tertiary,
  },
  recordingButton: {
    alignSelf: 'flex-start',
  },
  taskCard: {
    backgroundColor: colors.primary[50],
    borderWidth: 2,
    borderColor: colors.primary[200],
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  taskContent: {
    // backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    // padding: spacing.lg,
    marginBottom: spacing.md,
  },
  taskTagRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  taskTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  taskDesc: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing.md,
    lineHeight: fontSizes.sm * 1.5,
  },
  taskMeta: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  taskMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  taskMetaText: {
    fontSize: fontSizes.xs,
    color: colors.text.tertiary,
    fontWeight: fontWeights.medium,
  },
  taskHint: {
    fontSize: fontSizes.xs,
    color: colors.primary[700],
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  noDataText: {
    fontSize: fontSizes.sm,
    color: colors.text.muted,
    fontStyle: 'italic',
  },
});

export default ComplaintDetailScreen;