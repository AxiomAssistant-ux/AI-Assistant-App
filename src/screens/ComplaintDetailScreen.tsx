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
} from '../components';
import { ResolveComplaintModal, ResolveData } from '../components/ResolveComplaintModal';
import { ComplaintStatus } from '../lib/types';
import { colors, spacing, fontSizes, fontWeights, borderRadius } from '../theme';

type RouteParams = {
  ComplaintDetail: { id: string };
};

export const ComplaintDetailScreen: React.FC = () => {
  const route = useRoute<RouteProp<RouteParams, 'ComplaintDetail'>>();
  const navigation = useNavigation();
  const { id } = route.params;

  const {
    selectedComplaint: complaint,
    isLoadingDetail,
    fetchComplaint,
    updateComplaintStatus,
    assignComplaintToMe,
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
    fetchComplaint(id);
    return () => clearSelectedComplaint();
  }, [id]);

  const handleRefresh = useCallback(() => {
    fetchComplaint(id);
  }, [id]);

  const handleCall = () => {
    if (complaint?.customer.phone) {
      const phoneNumber = complaint.customer.phone.replace(/[^0-9+]/g, '');
      Linking.openURL(`tel:${phoneNumber}`);
    }
  };

  const handleAssign = async () => {
    setLoadingAction('assign');
    try {
      const updated = await assignComplaintToMe(id);
      updateComplaintOptimistic(updated);
      showSuccess('Complaint assigned to you');
    } catch (error) {
      showError('Failed to assign complaint');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleStatusChange = async (status: ComplaintStatus) => {
    setLoadingAction(status);
    try {
      const updated = await updateComplaintStatus(id, status);
      updateComplaintOptimistic(updated);
      showSuccess(`Status updated to ${status.replace('_', ' ')}`);
    } catch (error) {
      showError('Failed to update status');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleResolve = async (data: ResolveData) => {
    setIsResolving(true);
    try {
      const updated = await resolveComplaint(id, {
        compensation: data.compensation,
        resolution_notes: data.resolutionNotes,
      });
      updateComplaintOptimistic(updated);
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
    } catch (error) {
      showError('Failed to add note');
    } finally {
      setIsAddingNote(false);
    }
  };

  if (isLoadingDetail || !complaint) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header
          title="Complaint"
          leftIcon="arrow-back"
          onLeftPress={() => navigation.goBack()}
        />
        <DetailSkeleton />
      </SafeAreaView>
    );
  }

  const isUrgent =
    (complaint.complaint_severity === 'high' || complaint.complaint_severity === 'critical') &&
    (complaint.status === 'pending' || complaint.status === 'in_progress');

  const isResolved = complaint.status === 'resolved';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="Complaint"
        leftIcon="arrow-back"
        onLeftPress={() => navigation.goBack()}
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
              level={complaint.complaint_severity}
              message="This complaint requires immediate attention"
            />
          )}

          {/* Status & Severity */}
          <View style={styles.statusRow}>
            <UrgencyChip level={complaint.complaint_severity} type="severity" />
            <StatusChip status={complaint.status} />
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

          {/* Type & Description */}
          <Card style={styles.section}>
            <Text style={styles.complaintType}>{complaint.complaint_type}</Text>
            <Text style={styles.description}>{complaint.complaint_description}</Text>
          </Card>

          {/* Customer Info */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Customer</Text>
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
          </Card>

          {/* Store Info */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Store</Text>
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
          </Card>

          {/* Quick Actions - Only show if not resolved */}
          {!isResolved && (
            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.actionsGrid}>
                <ActionButton
                  label="Call Customer"
                  icon="call-outline"
                  variant="call"
                  onPress={handleCall}
                  disabled={!!loadingAction}
                  style={styles.actionButton}
                />
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

            {complaint.notes.length === 0 && !showNoteInput ? (
              <Text style={styles.noNotes}>No notes yet</Text>
            ) : (
              complaint.notes.map((note) => (
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
    </SafeAreaView>
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
});

export default ComplaintDetailScreen;
