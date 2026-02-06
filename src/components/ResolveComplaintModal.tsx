import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSizes, fontWeights, borderRadius } from '../theme';
import { Button } from './Button';
import { Input, TextArea } from './Input';

export interface ResolveData {
  compensation: string;
  resolutionNotes?: string;
}

interface ResolveComplaintModalProps {
  visible: boolean;
  onClose: () => void;
  onResolve: (data: ResolveData) => Promise<void>;
  isLoading?: boolean;
  complaintType?: string;
}

const compensationOptions = [
  // { value: 'voucher_10', label: '$10 Voucher' },
  // { value: 'voucher_25', label: '$25 Voucher' },
  // { value: 'voucher_50', label: '$50 Voucher' },
  { value: 'coupon', label: 'Coupon' },
  { value: 'replacement', label: 'Order Replacement' },
  { value: 'none', label: 'No Compensation' },
];

export const ResolveComplaintModal: React.FC<ResolveComplaintModalProps> = ({
  visible,
  onClose,
  onResolve,
  isLoading = false,
  complaintType,
}) => {
  const [compensation, setCompensation] = useState('');
  const [customCompensation, setCustomCompensation] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleResolve = async () => {
    const finalCompensation = compensation === 'custom' ? customCompensation : compensation;

    if (!finalCompensation.trim()) {
      setError('Please select or enter a compensation');
      return;
    }

    setError(null);

    try {
      await onResolve({
        compensation: finalCompensation,
        resolutionNotes: resolutionNotes.trim() || undefined,
      });
      // Reset form on success
      setCompensation('');
      setCustomCompensation('');
      setResolutionNotes('');
    } catch (err) {
      // Error handling is done in parent
    }
  };

  const handleClose = () => {
    setCompensation('');
    setCustomCompensation('');
    setResolutionNotes('');
    setError(null);
    onClose();
  };

  const isValid = compensation === 'custom'
    ? (customCompensation || '').trim().length > 0
    : (compensation || '').length > 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        />
        <View style={styles.container}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons name="checkmark-circle" size={28} color={colors.success[500]} />
            </View>
            <Text style={styles.title}>Resolve</Text>
            {complaintType && (
              <Text style={styles.subtitle} numberOfLines={1}>
                {complaintType}
              </Text>
            )}
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Compensation Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Compensation / Voucher <Text style={styles.required}>*</Text>
              </Text>
              <Text style={styles.sectionDescription}>
                Select the compensation offered to the customer
              </Text>

              <View style={styles.optionsGrid}>
                {compensationOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionButton,
                      compensation === option.value && styles.optionButtonSelected,
                    ]}
                    onPress={() => {
                      setCompensation(option.value);
                      setError(null);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        compensation === option.value && styles.optionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                    {compensation === option.value && (
                      <Ionicons name="checkmark" size={16} color={colors.primary[600]} />
                    )}
                  </TouchableOpacity>
                ))}

                {/* Custom option */}
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    compensation === 'custom' && styles.optionButtonSelected,
                  ]}
                  onPress={() => {
                    setCompensation('custom');
                    setError(null);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.optionText,
                      compensation === 'custom' && styles.optionTextSelected,
                    ]}
                  >
                    Other...
                  </Text>
                  {compensation === 'custom' && (
                    <Ionicons name="checkmark" size={16} color={colors.primary[600]} />
                  )}
                </TouchableOpacity>
              </View>

              {compensation === 'custom' && (
                <Input
                  placeholder="Enter custom compensation..."
                  value={customCompensation}
                  onChangeText={(text) => {
                    setCustomCompensation(text);
                    setError(null);
                  }}
                  autoFocus
                />
              )}

              {error && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={16} color={colors.error[500]} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}
            </View>

            {/* Resolution Notes */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Resolution Notes</Text>
              <Text style={styles.sectionDescription}>
                Optional: Add any notes about how the issue was resolved
              </Text>
              <TextArea
                placeholder="Enter resolution details..."
                value={resolutionNotes}
                onChangeText={setResolutionNotes}
                rows={3}
              />
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              label="Cancel"
              variant="ghost"
              onPress={handleClose}
              style={styles.actionButton}
              disabled={isLoading}
            />
            <Button
              label="Resolve Complaint"
              onPress={handleResolve}
              style={styles.actionButton}
              loading={isLoading}
              disabled={!isValid}
              icon="checkmark-circle-outline"
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    maxHeight: '85%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.gray[300],
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.success[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
  },
  scrollView: {
    paddingHorizontal: spacing.xl,
  },
  section: {
    paddingVertical: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  sectionDescription: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  required: {
    color: colors.error[500],
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.white,
    minWidth: '48%',
    gap: spacing.sm,
  },
  optionButtonSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  optionText: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
    fontWeight: fontWeights.medium,
  },
  optionTextSelected: {
    color: colors.primary[700],
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  errorText: {
    fontSize: fontSizes.sm,
    color: colors.error[500],
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl + 20 : spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  actionButton: {
    flex: 1,
  },
});

export default ResolveComplaintModal;
