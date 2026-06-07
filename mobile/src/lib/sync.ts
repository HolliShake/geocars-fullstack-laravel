import * as Network from 'expo-network';
import { useCallback, useEffect } from 'react';
import { AppState } from 'react-native';

import { api } from './api';
import {
  deletePendingBinding,
  deletePendingLocation,
  getPendingBindings,
  getPendingLocations,
} from './database';

/**
 * Flush all locally-stored pending bindings to the server.
 */
export async function syncPendingBindings(): Promise<void> {
  const state = await Network.getNetworkStateAsync();
  if (!state.isConnected || !state.isInternetReachable) return;

  const pending = getPendingBindings();
  for (const binding of pending) {
    try {
      await api.bindDevice(binding.device_identifier, binding.car_rental_id);
      deletePendingBinding(binding.id);
    } catch (err: unknown) {
      const status = (err as { status?: number }).status;
      if (status === 422) deletePendingBinding(binding.id); // already bound
    }
  }
}

/**
 * Flush all locally-queued GPS locations to the server.
 * Batches up to 100 rows per call (see getPendingLocations LIMIT).
 */
export async function syncPendingLocations(): Promise<void> {
  const state = await Network.getNetworkStateAsync();
  if (!state.isConnected || !state.isInternetReachable) return;

  const pending = getPendingLocations();
  for (const loc of pending) {
    try {
      await api.postLocation(loc.device_id, loc.latitude, loc.longitude);
      deletePendingLocation(loc.id);
    } catch (err: unknown) {
      const status = (err as { status?: number }).status;
      // 422 = validation error (e.g. device no longer exists) – discard
      if (status === 422 || status === 404) deletePendingLocation(loc.id);
      // Otherwise leave it and retry next cycle
    }
  }
}

/**
 * Run both sync jobs.
 */
export async function syncAll(): Promise<void> {
  await syncPendingBindings();
  await syncPendingLocations();
}

/**
 * Hook that runs syncAll on mount and every time the app comes back to the
 * foreground (e.g. regains network access).
 */
export function useSyncOnResume(): void {
  const sync = useCallback(() => {
    syncAll().catch(() => {});
  }, []);

  useEffect(() => {
    sync();

    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') sync();
    });

    return () => sub.remove();
  }, [sync]);
}
