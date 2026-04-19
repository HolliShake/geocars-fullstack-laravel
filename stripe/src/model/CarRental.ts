export type CarRental = {
  id: number;
  image?: File | string;
  /** Stripe `unit_amount`: smallest currency unit (e.g. PHP centavos). */
  amount: number;
};
