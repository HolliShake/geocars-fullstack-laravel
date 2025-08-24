export type CarType = 'sedan' | 'hatchback' | 'suv' | 'mpv' | 'coupe' | 'convertible' | 'other';

export const CarTypeEnum: Record<CarType, CarType> = Object.freeze({
  sedan: 'sedan',
  hatchback: 'hatchback',
  suv: 'suv',
  mpv: 'mpv',
  coupe: 'coupe',
  convertible: 'convertible',
  other: 'other',
} as const);
