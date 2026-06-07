/**
 * Background location task definition.
 *
 * IMPORTANT: TaskManager.defineTask MUST be called at the module top-level.
 * Import this file from _layout.tsx to ensure the task is registered before
 * the app tries to start it.
 */
import * as Location from 'expo-location';
import * as Network from 'expo-network';
import * as TaskManager from 'expo-task-manager';

import { api, getBoundDeviceId } from './api';
import { initDatabase, storePendingLocation } from './database';

export const LOCATION_TASK_NAME = 'geocars-location-task';

TaskManager.defineTask(
  LOCATION_TASK_NAME,
  async ({ data, error }: TaskManager.TaskManagerTaskBody) => {
    if (error) {
      console.warn('[GeoCars] Location task error:', error.message);
      return;
    }

    const { locations } = data as { locations: Location.LocationObject[] };
    if (!locations?.length) return;

    // Ensure DB tables exist even when launched in background
    try {
      initDatabase();
    } catch {
      // table already exists – ignore
    }

    const deviceId = await getBoundDeviceId();
    if (!deviceId) return; // no binding yet

    for (const loc of locations) {
      const { latitude, longitude } = loc.coords;
      let isOnline = false;
      try {
        const net = await Network.getNetworkStateAsync();
        isOnline = !!(net?.isConnected && net?.isInternetReachable);
      } catch {
        isOnline = false;
      }

      if (isOnline) {
        try {
          await api.postLocation(deviceId, latitude, longitude);
        } catch {
          storePendingLocation(deviceId, latitude, longitude);
        }
      } else {
        storePendingLocation(deviceId, latitude, longitude);
      }
    }
  }
);
