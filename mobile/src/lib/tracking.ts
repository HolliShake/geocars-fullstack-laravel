import * as Location from 'expo-location';

import { LOCATION_TASK_NAME } from './tasks';

/** How often the background task wakes up to record a fix (ms). */
const TRACKING_INTERVAL_MS = 20_000; // 20 s
/**
 * Minimum distance the device must move before a new background fix is emitted.
 * Set to 0 so time-based fixes always go through (important for parked cars).
 */
const TRACKING_DISTANCE_M = 0;

export interface TrackingPermissionResult {
  foreground: boolean;
  background: boolean;
}

/** Request both foreground and background location permissions. */
export async function requestLocationPermissions(): Promise<TrackingPermissionResult> {
  const { status: fg } = await Location.requestForegroundPermissionsAsync();
  if (fg !== 'granted') return { foreground: false, background: false };

  const { status: bg } = await Location.requestBackgroundPermissionsAsync();
  return { foreground: true, background: bg === 'granted' };
}

/** Start background GPS tracking via the registered TaskManager task. */
export async function startTracking(): Promise<boolean> {
  const perms = await requestLocationPermissions();
  if (!perms.foreground) return false;

  const alreadyRunning = await isTracking();
  if (alreadyRunning) return true;

  const options: Location.LocationTaskOptions = {
    accuracy: Location.Accuracy.High,
    timeInterval: TRACKING_INTERVAL_MS,
    distanceInterval: TRACKING_DISTANCE_M,
    pausesUpdatesAutomatically: false,
    // iOS – batch updates every 20 s even when deferred
    deferredUpdatesInterval: TRACKING_INTERVAL_MS,
    deferredUpdatesDistance: TRACKING_DISTANCE_M,
    // Android foreground service notification (required for background)
    foregroundService: {
      notificationTitle: 'GeoCars – Tracking Active',
      notificationBody: 'Your rental vehicle location is being tracked.',
      notificationColor: '#208AEF',
      killServiceOnDestroy: false,
    },
    // iOS – keep running even when app is killed
    activityType: Location.ActivityType.AutomotiveNavigation,
    showsBackgroundLocationIndicator: true,
  };

  try {
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, options);
    return true;
  } catch (err) {
    console.warn('[GeoCars] Failed to start location updates:', err);
    return false;
  }
}

/** Stop background GPS tracking. */
export async function stopTracking(): Promise<void> {
  if (await isTracking()) {
    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME).catch(() => {});
  }
}

/** Returns true if the background task is currently registered and running. */
export async function isTracking(): Promise<boolean> {
  return Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME).catch(() => false);
}

/** One-shot current position read (for immediate display). */
export async function getCurrentPosition(): Promise<Location.LocationObject | null> {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== 'granted') return null;
    return await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
  } catch {
    return null;
  }
}
