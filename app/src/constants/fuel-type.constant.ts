export type FuelType = 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'other';

export const FuelTypeEnum: Record<FuelType, FuelType> = Object.freeze({
  petrol: 'petrol',
  diesel: 'diesel',
  electric: 'electric',
  hybrid: 'hybrid',
  other: 'other',
} as const);
