export const PaymentMethod = {
  CASH: 'cash',
  ONLINE: 'online',
} as const;

export type PaymentMethodType = (typeof PaymentMethod)[keyof typeof PaymentMethod];
