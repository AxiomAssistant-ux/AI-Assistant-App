import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSizes, fontWeights, borderRadius } from '../theme';
import { Button, Input } from '../components';
import { api } from '../lib/api';
import { showError, showSuccess } from '../stores';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SCAN_AREA_SIZE = SCREEN_WIDTH * 0.7;

// QR format: COMPLAINT-{id} or just the complaint ID
const COMPLAINT_QR_REGEX = /^(?:COMPLAINT-)?([a-zA-Z0-9_-]+)$/;

export const QRScannerScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualId, setManualId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleBarCodeScanned = useCallback(async (result: BarcodeScanningResult) => {
    if (scanned || isLoading) return;

    const { data } = result;
    setScanned(true);
    setError(null);

    await processComplaintId(data);
  }, [scanned, isLoading]);

  const processComplaintId = async (rawData: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate QR format
      const match = rawData.match(COMPLAINT_QR_REGEX);
      if (!match) {
        setError('Invalid QR code format. Please scan a valid complaint QR code.');
        setIsLoading(false);
        return;
      }

      const complaintId = match[1];

      // Fetch complaint to validate it exists and belongs to user's store
      const complaint = await api.getComplaint(complaintId);

      if (!complaint) {
        setError('Complaint not found. Please check the QR code and try again.');
        setIsLoading(false);
        return;
      }

      // Success - navigate to complaint detail
      showSuccess('Complaint found');
      navigation.replace('ComplaintDetail', { id: complaintId });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch complaint';

      if (message.includes('not found')) {
        setError('Complaint not found. This complaint may not exist or belong to your store.');
      } else if (message.includes('different store')) {
        setError('This complaint belongs to a different store.');
      } else {
        setError(message);
      }
      setIsLoading(false);
    }
  };

  const handleManualSubmit = async () => {
    if (!manualId.trim()) {
      setError('Please enter a complaint ID');
      return;
    }

    setShowManualEntry(false);
    setScanned(true);
    await processComplaintId(manualId.trim());
  };

  const handleRetry = () => {
    setScanned(false);
    setError(null);
    setIsLoading(false);
  };

  const handleClose = () => {
    navigation.goBack();
  };

  // Permission not determined yet
  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text style={styles.loadingText}>Initializing camera...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Permission denied
  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <View style={styles.permissionIcon}>
            <Ionicons name="camera-outline" size={64} color={colors.gray[400]} />
          </View>
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            To scan complaint QR codes, please allow camera access for this app.
          </Text>
          <Button
            label="Grant Permission"
            onPress={requestPermission}
            style={styles.permissionButton}
          />
          <TouchableOpacity onPress={handleClose} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        {/* Top overlay */}
        <View style={styles.overlayTop}>
          <SafeAreaView edges={['top']}>
            <View style={styles.header}>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={28} color={colors.white} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Scan Complaint QR</Text>
              <View style={styles.headerPlaceholder} />
            </View>
          </SafeAreaView>
        </View>

        {/* Middle section with scan area */}
        <View style={styles.overlayMiddle}>
          <View style={styles.overlaySide} />
          <View style={styles.scanArea}>
            {/* Corner decorations */}
            <View style={[styles.corner, styles.cornerTopLeft]} />
            <View style={[styles.corner, styles.cornerTopRight]} />
            <View style={[styles.corner, styles.cornerBottomLeft]} />
            <View style={[styles.corner, styles.cornerBottomRight]} />
          </View>
          <View style={styles.overlaySide} />
        </View>

        {/* Bottom overlay */}
        <View style={styles.overlayBottom}>
          {isLoading ? (
            <View style={styles.statusContainer}>
              <ActivityIndicator size="small" color={colors.white} />
              <Text style={styles.statusText}>Looking up complaint...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={24} color={colors.error[500]} />
              <Text style={styles.errorText}>{error}</Text>
              <Button
                label="Try Again"
                variant="outline"
                onPress={handleRetry}
                style={styles.retryButton}
              />
            </View>
          ) : (
            <View style={styles.instructionContainer}>
              <Text style={styles.instructionText}>
                Position the QR code within the frame
              </Text>
              <TouchableOpacity
                style={styles.manualEntryButton}
                onPress={() => setShowManualEntry(true)}
              >
                <Ionicons name="keypad-outline" size={20} color={colors.white} />
                <Text style={styles.manualEntryText}>Enter ID Manually</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Manual Entry Modal */}
      <Modal
        visible={showManualEntry}
        transparent
        animationType="slide"
        onRequestClose={() => setShowManualEntry(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Enter Complaint ID</Text>
              <TouchableOpacity
                onPress={() => setShowManualEntry(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={colors.gray[500]} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalDescription}>
              Enter the complaint ID manually if you cannot scan the QR code.
            </Text>
            <Input
              placeholder="e.g., COMP-12345"
              value={manualId}
              onChangeText={setManualId}
              autoCapitalize="characters"
              autoFocus
            />
            <View style={styles.modalActions}>
              <Button
                label="Cancel"
                variant="ghost"
                onPress={() => setShowManualEntry(false)}
                style={styles.modalButton}
              />
              <Button
                label="Look Up"
                onPress={handleManualSubmit}
                style={styles.modalButton}
                disabled={!manualId.trim()}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSizes.md,
    color: colors.text.secondary,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background.primary,
  },
  permissionIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  permissionTitle: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: fontSizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: fontSizes.md * 1.5,
  },
  permissionButton: {
    width: '100%',
    marginBottom: spacing.md,
  },
  cancelButton: {
    padding: spacing.md,
  },
  cancelText: {
    fontSize: fontSizes.md,
    color: colors.text.secondary,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.white,
  },
  headerPlaceholder: {
    width: 44,
  },
  overlayMiddle: {
    flexDirection: 'row',
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  scanArea: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: colors.primary[500],
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  statusText: {
    fontSize: fontSizes.md,
    color: colors.white,
  },
  errorContainer: {
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  errorText: {
    fontSize: fontSizes.md,
    color: colors.white,
    textAlign: 'center',
    lineHeight: fontSizes.md * 1.5,
  },
  retryButton: {
    marginTop: spacing.md,
    borderColor: colors.white,
  },
  instructionContainer: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  instructionText: {
    fontSize: fontSizes.md,
    color: colors.white,
    textAlign: 'center',
  },
  manualEntryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: borderRadius.full,
  },
  manualEntryText: {
    fontSize: fontSizes.sm,
    color: colors.white,
    fontWeight: fontWeights.medium,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    padding: spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl + 20 : spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.text.primary,
  },
  modalCloseButton: {
    padding: spacing.xs,
  },
  modalDescription: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  modalButton: {
    flex: 1,
  },
});

export default QRScannerScreen;
