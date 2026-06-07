import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { fetchData } from './axios';
import type { UserAccount } from './user-account.custom';

export interface FinishCarRentalData {
  rental: {
    id: number;
    rental_status: string;
    return_date: string;
    refundable_amount: number;
    additional_charges: number;
    [key: string]: unknown;
  };
  refundable_amount: number;
  additional_charges: number;
  refund_transaction: {
    id: number;
    car_rental_id: number;
    amount: number;
    type: string;
    reference_number: string;
  } | null;
  stripe_refund_id: string | null;
  payout_account: UserAccount | null;
}

export interface FinishCarRentalResponse {
  status: string;
  data: FinishCarRentalData;
}

export const finishCarRental = (
  id: number,
  signal?: AbortSignal
): Promise<FinishCarRentalResponse> => {
  return fetchData<FinishCarRentalResponse>({
    url: `/api/CarRental/${id}/finish`,
    method: 'POST',
    signal,
  });
};

export const useFinishCarRental = (options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof finishCarRental>>,
    unknown,
    { id: number }
  >;
}) => {
  const mutationFn = ({ id }: { id: number }) => finishCarRental(id);
  return useMutation({ mutationFn, ...options?.mutation });
};
