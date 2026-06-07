import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getBoundDeviceId, removeToken } from '@/lib/api';
import { getPendingLocations } from '@/lib/database';
import { syncAll } from '@/lib/sync';
import { getCurrentPosition, isTracking, startTracking, stopTracking } from '@/lib/tracking';
import { Colors, Spacing } from '@/constants/theme';

interface TrackingStatus {
  running: boolean;
  deviceId: number | null;
  lastPosition: Location.LocationObject | null;
  pendingCount: number;
}

export default function HomeScreen() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const styles = makeStyles(colors);

  const [status, setStatus] = useState<TrackingStatus>({
    running: false,
    deviceId: null,
    lastPosition: null,
    pendingCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);

  const refresh = useCallback(async () => {
    const [running, deviceId, lastPosition] = await Promise.all([
      isTracking(),
      getBoundDeviceId(),
      getCurrentPosition(),
    ]);
    const pendingCount = getPendingLocations().length;
    setStatus({ running, deviceId, lastPosition, pendingCount });
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const handleToggleTracking = async () => {
    setActionBusy(true);
    try {
      if (status.running) {
        await stopTracking();
      } else {
        await startTracking();
      }
      await refresh();
    } finally {
      setActionBusy(false);
    }
  };

  const handleSyncNow = async () => {
    setActionBusy(true);
    try {
      await syncAll();
      await refresh();
    } finally {
      setActionBusy(false);
    }
  };

  const handleLogout = async () => {
    await stopTracking();
    await removeToken();
    router.replace('/login');
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#208AEF" />
      </View>
    );
  }

  const hasBinding = status.deviceId !== null;
  const lat = status.lastPosition?.coords.latitude;
  const lon = status.lastPosition?.coords.longitude;
  const acc = status.lastPosition?.coords.accuracy;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: colors.text }]}>GeoCars</Text>
          <Pressable onPress={handleLogout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Log out</Text>
          </Pressable>
        </View>

        {/* Tracking status card */}
        <View style={[styles.card, { backgroundColor: colors.backgroundElement }]}>
          <View style={styles.statusDot}>
            <View
              style={[styles.dot, { backgroundColor: status.running ? '#16A34A' : '#DC2626' }]}
            />
            <Text style={[styles.statusLabel, { color: colors.text }]}>
              {status.running ? 'Tracking Active' : 'Tracking Inactive'}
            </Text>
          </View>

          {hasBinding ? (
            <Text style={[styles.meta, { color: colors.textSecondary }]}>
              Device #{status.deviceId} · bound to rental
            </Text>
          ) : (
            <Text style={[styles.meta, { color: colors.textSecondary }]}>
              No binding yet – scan a QR code first
            </Text>
          )}

          {lat !== undefined && lon !== undefined && (
            <View style={[styles.coordBox, { backgroundColor: colors.backgroundSelected }]}>
              <Text style={[styles.coordLabel, { color: colors.textSecondary }]}>
                Last known position
              </Text>
              <Text style={[styles.coordValue, { color: colors.text }]}>
                {lat.toFixed(6)}, {lon.toFixed(6)}
              </Text>
              {acc !== undefined && acc !== null && (
                <Text style={[styles.coordAcc, { color: colors.textSecondary }]}>
                  ±{Math.round(acc)} m accuracy
                </Text>
              )}
            </View>
          )}

          {status.pendingCount > 0 && (
            <View style={styles.pendingBanner}>
              <Text style={styles.pendingText}>
                {status.pendingCount} location{status.pendingCount > 1 ? 's' : ''} queued offline
              </Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {hasBinding && (
            <Pressable
              style={({ pressed }) => [
                styles.actionBtn,
                status.running ? styles.btnStop : styles.btnStart,
                pressed && styles.btnPressed,
              ]}
              onPress={handleToggleTracking}
              disabled={actionBusy}
            >
              {actionBusy ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.actionBtnText}>
                  {status.running ? 'Stop Tracking' : 'Start Tracking'}
                </Text>
              )}
            </Pressable>
          )}

          {status.pendingCount > 0 && (
            <Pressable
              style={({ pressed }) => [
                styles.actionBtn,
                styles.btnSync,
                pressed && styles.btnPressed,
              ]}
              onPress={handleSyncNow}
              disabled={actionBusy}
            >
              {actionBusy ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.actionBtnText}>Sync Now ({status.pendingCount})</Text>
              )}
            </Pressable>
          )}

          {!hasBinding && (
            <Pressable
              style={({ pressed }) => [
                styles.actionBtn,
                styles.btnStart,
                pressed && styles.btnPressed,
              ]}
              onPress={() => router.push('/scan')}
            >
              <Text style={styles.actionBtnText}>Scan QR to Bind</Text>
            </Pressable>
          )}
        </View>

        <Text style={[styles.hint, { color: colors.textSecondary }]}>
          Pull to refresh · GPS updates every 30 s or 30 m
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(colors: (typeof Colors)['light'] | (typeof Colors)['dark']) {
  return StyleSheet.create({
    root: { flex: 1 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    scroll: {
      padding: Spacing.four,
      gap: Spacing.three,
      paddingBottom: 40,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: Spacing.two,
    },
    title: { fontSize: 22, fontWeight: '800' },
    logoutBtn: { paddingVertical: 4, paddingHorizontal: 8 },
    logoutText: { color: '#208AEF', fontSize: 14 },
    card: {
      borderRadius: 16,
      padding: Spacing.four,
      gap: Spacing.two,
    },
    statusDot: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    dot: { width: 12, height: 12, borderRadius: 6 },
    statusLabel: { fontSize: 18, fontWeight: '700' },
    meta: { fontSize: 13 },
    coordBox: {
      borderRadius: 10,
      padding: 12,
      marginTop: 4,
      gap: 2,
    },
    coordLabel: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 },
    coordValue: { fontSize: 15, fontWeight: '600', fontVariant: ['tabular-nums'] },
    coordAcc: { fontSize: 12 },
    pendingBanner: {
      backgroundColor: '#FEF3C7',
      borderRadius: 8,
      paddingVertical: 6,
      paddingHorizontal: 10,
      marginTop: 4,
    },
    pendingText: { color: '#92400E', fontSize: 13, fontWeight: '600' },
    actions: { gap: Spacing.two },
    actionBtn: {
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: 'center',
    },
    btnStart: { backgroundColor: '#16A34A' },
    btnStop: { backgroundColor: '#DC2626' },
    btnSync: { backgroundColor: '#208AEF' },
    btnPressed: { opacity: 0.8 },
    actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
    hint: { fontSize: 12, textAlign: 'center', marginTop: 4 },
  });
}
