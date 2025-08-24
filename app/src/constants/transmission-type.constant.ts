export type TransmissionType = 'manual' | 'automatic' | 'other';

export const TransmissionTypeEnum: Record<TransmissionType, TransmissionType> = Object.freeze({
  manual: 'manual',
  automatic: 'automatic',
  other: 'other',
} as const);
