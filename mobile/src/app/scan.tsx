import * as Network from 'expo-network';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { api, getDeviceId, removeToken, setBoundDeviceId } from '@/lib/api';
import { storePendingBinding } from '@/lib/database';
import { syncAll, useSyncOnResume } from '@/lib/sync';
import { startTracking } from '@/lib/tracking';
import { Colors } from '@/constants/theme';

interface QRPayload {
  car_rental_id: number;
  user_id: number;
}

type ScanState = 'idle' | 'processing' | 'success' | 'error' | 'offline';

export default function ScanScreen() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const styles = makeStyles(colors);

  const [permission, requestPermission] = useCameraPermissions();
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [message, setMessage] = useState('');
  const lockRef = useRef(false); // prevent double-scan

  // Sync any offline-stored bindings whenever the app resumes / goes online
  useSyncOnResume();

  const handleBarcodeScan = useCallback(async ({ data }: { data: string }) => {
    if (lockRef.current) return;
    lockRef.current = true;

    let payload: QRPayload;
    try {
      payload = JSON.parse(data) as QRPayload;
      if (!payload.car_rental_id || !payload.user_id) throw new Error('invalid');
    } catch {
      setMessage('Invalid QR code. Please scan the code shown on the booking page.');
      setScanState('error');
      setTimeout(() => {
        setScanState('idle');
        lockRef.current = false;
      }, 3000);
      return;
    }

    setScanState('processing');

    const deviceId = await getDeviceId();
    const networkState = await Network.getNetworkStateAsync();
    const isOnline = networkState.isConnected && networkState.isInternetReachable;

    if (!isOnline) {
      // Store locally and inform user
      storePendingBinding(deviceId, payload.car_rental_id);
      setMessage(
        `No internet connection.\nBinding saved locally for Rental #${payload.car_rental_id}.\nIt will be sent automatically when you reconnect.`
      );
      setScanState('offline');
      lockRef.current = false;
      return;
    }

    try {
      const res = await api.bindDevice(deviceId, payload.car_rental_id);
      const serverDeviceId = res.data.id;
      // Persist the server-assigned device ID used for location submissions
      await setBoundDeviceId(serverDeviceId);
      // Flush any previously queued offline data and start GPS tracking
      await syncAll();
      await startTracking();
      setMessage(`Device bound to Rental #${payload.car_rental_id}. GPS tracking started.`);
      setScanState('success');
    } catch (err: unknown) {
      const status = (err as { status?: number }).status;
      if (status === 422) {
        // Already bound – tracking may already be running
        await startTracking();
        setMessage('This device is already bound to the rental. GPS tracking is active.');
        setScanState('success');
      } else {
        // Server unreachable – store binding offline, tracking will start after sync
        storePendingBinding(deviceId, payload.car_rental_id);
        setMessage(
          `No connection. Binding saved locally for Rental #${payload.car_rental_id}. GPS tracking will start once synced.`
        );
        setScanState('offline');
      }
      lockRef.current = false;
    }
  }, []);

  const reset = () => {
    setScanState('idle');
    setMessage('');
    lockRef.current = false;
  };

  const handleLogout = async () => {
    await removeToken();
    router.replace('/login');
  };

  // ── Permission not yet determined ──────────────────────────────────────────
  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#208AEF" />
      </View>
    );
  }

  // ── Permission denied ──────────────────────────────────────────────────────
  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.permissionText, { color: colors.text }]}>
          Camera access is required to scan QR codes.
        </Text>
        <Pressable style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Camera Permission</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  // ── Result overlay ─────────────────────────────────────────────────────────
  if (scanState !== 'idle' && scanState !== 'processing') {
    const isSuccess = scanState === 'success';
    const isOffline = scanState === 'offline';
    const bgColor = isSuccess ? '#16A34A' : isOffline ? '#D97706' : '#DC2626';

    return (
      <SafeAreaView style={[styles.center, { backgroundColor: bgColor }]}>
        <Text style={styles.resultIcon}>{isSuccess ? '✓' : isOffline ? '⏳' : '✕'}</Text>
        <Text style={styles.resultTitle}>
          {isSuccess ? 'Bound!' : isOffline ? 'Saved Offline' : 'Error'}
        </Text>
        <Text style={styles.resultMessage}>{message}</Text>
        <Pressable style={styles.resetButton} onPress={reset}>
          <Text style={styles.resetText}>Scan Another</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  // ── Camera viewfinder ──────────────────────────────────────────────────────
  return (
    <View style={styles.root}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanState === 'idle' ? handleBarcodeScan : undefined}
      />

      {/* Dark vignette overlay with cut-out hint */}
      <View style={styles.overlay} pointerEvents="none">
        <View style={styles.topDim} />
        <View style={styles.middleRow}>
          <View style={styles.sideDim} />
          <View style={styles.scanBox}>
            {/* Corner markers */}
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
          <View style={styles.sideDim} />
        </View>
        <View style={styles.bottomDim} />
      </View>

      {scanState === 'processing' && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.processingText}>Binding device…</Text>
        </View>
      )}

      {/* Header */}
      <SafeAreaView style={styles.header} edges={['top']}>
        <Text style={styles.headerTitle}>Scan Rental QR Code</Text>
        <Pressable onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </SafeAreaView>

      {/* Footer hint */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Point your camera at the QR code shown on the booking page
        </Text>
      </View>
    </View>
  );
}

const SCAN_BOX = 240;
const CORNER = 20;
const CORNER_WIDTH = 3;

function makeStyles(colors: (typeof Colors)['light'] | (typeof Colors)['dark']) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: '#000' },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },

    // Permission screen
    permissionText: { fontSize: 16, textAlign: 'center', marginBottom: 20 },
    button: {
      backgroundColor: '#208AEF',
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 28,
    },
    buttonText: { color: '#fff', fontWeight: '700', fontSize: 15 },

    // Result screen
    resultIcon: { fontSize: 64, color: '#fff', marginBottom: 12 },
    resultTitle: { fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: 10 },
    resultMessage: {
      fontSize: 15,
      color: 'rgba(255,255,255,0.9)',
      textAlign: 'center',
      marginHorizontal: 24,
      lineHeight: 22,
    },
    resetButton: {
      marginTop: 32,
      backgroundColor: 'rgba(255,255,255,0.25)',
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 32,
    },
    resetText: { color: '#fff', fontWeight: '700', fontSize: 15 },

    // Overlay
    overlay: { ...StyleSheet.absoluteFill },
    topDim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
    middleRow: { flexDirection: 'row', height: SCAN_BOX },
    sideDim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
    bottomDim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
    scanBox: { width: SCAN_BOX, height: SCAN_BOX, position: 'relative' },

    // Corners
    corner: {
      position: 'absolute',
      width: CORNER,
      height: CORNER,
      borderColor: '#fff',
    },
    cornerTL: {
      top: 0,
      left: 0,
      borderTopWidth: CORNER_WIDTH,
      borderLeftWidth: CORNER_WIDTH,
      borderTopLeftRadius: 4,
    },
    cornerTR: {
      top: 0,
      right: 0,
      borderTopWidth: CORNER_WIDTH,
      borderRightWidth: CORNER_WIDTH,
      borderTopRightRadius: 4,
    },
    cornerBL: {
      bottom: 0,
      left: 0,
      borderBottomWidth: CORNER_WIDTH,
      borderLeftWidth: CORNER_WIDTH,
      borderBottomLeftRadius: 4,
    },
    cornerBR: {
      bottom: 0,
      right: 0,
      borderBottomWidth: CORNER_WIDTH,
      borderRightWidth: CORNER_WIDTH,
      borderBottomRightRadius: 4,
    },

    // Processing
    processingOverlay: {
      ...StyleSheet.absoluteFill,
      backgroundColor: 'rgba(0,0,0,0.55)',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
    },
    processingText: { color: '#fff', fontSize: 16, fontWeight: '600' },

    // Header
    header: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 12,
      backgroundColor: 'rgba(0,0,0,0.45)',
    },
    headerTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
    logoutBtn: { paddingVertical: 4, paddingHorizontal: 8 },
    logoutText: { color: 'rgba(255,255,255,0.75)', fontSize: 13 },

    // Footer
    footer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingBottom: 40,
      paddingTop: 16,
      backgroundColor: 'rgba(0,0,0,0.45)',
      alignItems: 'center',
    },
    footerText: {
      color: 'rgba(255,255,255,0.8)',
      fontSize: 13,
      textAlign: 'center',
      paddingHorizontal: 32,
    },
  });
}
