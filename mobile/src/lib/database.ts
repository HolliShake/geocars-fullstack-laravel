import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('geocars.db');

export interface PendingBinding {
  id: number;
  device_identifier: string;
  car_rental_id: number;
  created_at: string;
}

export function initDatabase(): void {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS pending_bindings (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      device_identifier TEXT NOT NULL,
      car_rental_id  INTEGER NOT NULL,
      created_at     TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS pending_locations (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id INTEGER NOT NULL,
      latitude  REAL NOT NULL,
      longitude REAL NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
}

export function storePendingBinding(deviceIdentifier: string, carRentalId: number): void {
  db.runSync(
    'INSERT INTO pending_bindings (device_identifier, car_rental_id, created_at) VALUES (?, ?, ?)',
    deviceIdentifier,
    carRentalId,
    new Date().toISOString()
  );
}

export function getPendingBindings(): PendingBinding[] {
  return db.getAllSync<PendingBinding>('SELECT * FROM pending_bindings ORDER BY created_at ASC');
}

export function deletePendingBinding(id: number): void {
  db.runSync('DELETE FROM pending_bindings WHERE id = ?', id);
}

// ─── Pending locations ────────────────────────────────────────────────────────

export interface PendingLocation {
  id: number;
  device_id: number;
  latitude: number;
  longitude: number;
  created_at: string;
}

export function storePendingLocation(deviceId: number, latitude: number, longitude: number): void {
  db.runSync(
    'INSERT INTO pending_locations (device_id, latitude, longitude, created_at) VALUES (?, ?, ?, ?)',
    deviceId,
    latitude,
    longitude,
    new Date().toISOString()
  );
}

export function getPendingLocations(): PendingLocation[] {
  return db.getAllSync<PendingLocation>(
    'SELECT * FROM pending_locations ORDER BY created_at ASC LIMIT 100'
  );
}

export function deletePendingLocation(id: number): void {
  db.runSync('DELETE FROM pending_locations WHERE id = ?', id);
}

export function clearPendingLocations(): void {
  db.runSync('DELETE FROM pending_locations');
}
