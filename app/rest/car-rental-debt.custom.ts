import type { CarRental } from '@rest/models/carRental';
import {
  useMutation,
  useQuery,
  type UseMutationOptions,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { fetchData } from './axios';
import type { UserAccount } from './user-account.custom';

export interface PendingDebtPaginated {
  data: CarRental[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export interface ApiResponse<T> {
  status: string;
  data: T;
}

export interface PendingDebtParams {
  search?: string;
  page?: number;
  rows?: number;
}

export interface CollectDebtResponseData {
  rental: CarRental;
  collected_amount: number;
  collected_from_account: UserAccount;
  transaction: {
    id: number;
    car_rental_id: number;
    amount: number;
    type: string;
    reference_number: string;
  };
}

export const getPendingDebtCarRentals = (
  params: PendingDebtParams,
  signal?: AbortSignal
): Promise<ApiResponse<PendingDebtPaginated>> => {
  return fetchData<ApiResponse<PendingDebtPaginated>>({
    url: '/api/CarRental/Debt/Pending',
    method: 'GET',
    params,
    signal,
  });
};

export const getPendingDebtCarRentalsQueryKey = (params: PendingDebtParams) =>
  ['/api/CarRental/Debt/Pending', params] as const;

export const useGetPendingDebtCarRentals = (
  params: PendingDebtParams,
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof getPendingDebtCarRentals>>,
        unknown,
        Awaited<ReturnType<typeof getPendingDebtCarRentals>>
      >
    >;
  }
) => {
  const queryKey = options?.query?.queryKey ?? getPendingDebtCarRentalsQueryKey(params);
  const queryFn = ({ signal }: { signal?: AbortSignal }) =>
    getPendingDebtCarRentals(params, signal);

  return useQuery({
    queryKey,
    queryFn,
    ...options?.query,
  });
};

export const collectCarRentalDebt = (
  id: number,
  signal?: AbortSignal
): Promise<ApiResponse<CollectDebtResponseData>> => {
  return fetchData<ApiResponse<CollectDebtResponseData>>({
    url: `/api/CarRental/${id}/collect-debt`,
    method: 'POST',
    signal,
  });
};

export const useCollectCarRentalDebt = (options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof collectCarRentalDebt>>,
    unknown,
    { id: number }
  >;
}) => {
  const mutationFn = ({ id }: { id: number }) => collectCarRentalDebt(id);
  return useMutation({ mutationFn, ...options?.mutation });
};
