import * as SecureStore from 'expo-secure-store';

// Update this to match your backend IP / host reachable from the device.
// For Android emulator: 10.0.2.2  |  iOS simulator: 127.0.0.1  |  Real device: LAN IP
export const API_BASE = 'http://10.0.2.2:8000/api';

// ─── Bound device helpers (server-assigned integer ID after QR binding) ──────

export async function getBoundDeviceId(): Promise<number | null> {
  const val = await SecureStore.getItemAsync('bound_device_id');
  return val ? parseInt(val, 10) : null;
}

export async function setBoundDeviceId(id: number): Promise<void> {
  await SecureStore.setItemAsync('bound_device_id', String(id));
}

export async function clearBoundDeviceId(): Promise<void> {
  await SecureStore.deleteItemAsync('bound_device_id');
}

// ─── Token helpers ───────────────────────────────────────────────────────────

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync('auth_token');
}

export async function setToken(token: string): Promise<void> {
  await SecureStore.setItemAsync('auth_token', token);
}

export async function removeToken(): Promise<void> {
  await SecureStore.deleteItemAsync('auth_token');
}

// ─── Device ID helpers ───────────────────────────────────────────────────────

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function getDeviceId(): Promise<string> {
  let id = await SecureStore.getItemAsync('device_id');
  if (!id) {
    id = generateUUID();
    await SecureStore.setItemAsync('device_id', id);
  }
  return id;
}

// ─── Base request ────────────────────────────────────────────────────────────

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok)
    throw Object.assign(new Error(data.message ?? 'Request failed'), { status: res.status, data });
  return data as T;
}

// ─── API methods ─────────────────────────────────────────────────────────────

export interface DeviceResponse {
  id: number;
  device_identifier: string;
  car_rental_id: number;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  token: string;
  user: { id: number; name: string; email: string };
}

export const api = {
  login: (email: string, password: string) =>
    request<LoginResponse>('/Auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  bindDevice: (deviceIdentifier: string, carRentalId: number) =>
    request<{ success: boolean; data: DeviceResponse }>('/Device', {
      method: 'POST',
      body: JSON.stringify({ device_identifier: deviceIdentifier, car_rental_id: carRentalId }),
    }),

  postLocation: (deviceId: number, latitude: number, longitude: number) =>
    request<unknown>('/DeviceLocation', {
      method: 'POST',
      body: JSON.stringify({ device_id: deviceId, latitude, longitude }),
    }),
};
