import {
  useMutation,
  useQuery,
  type UseMutationOptions,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { fetchData } from './axios';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled';
export type TransactionType = 'payment' | 'renewal' | 'refund';

export interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  price: number;
  active: boolean;
}

export interface SubscriptionTransaction {
  id: number;
  user_subscription_id: number;
  amount: string;
  type: TransactionType;
  stripe_session_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserSubscription {
  id: number;
  user_id: number;
  plan_id: number;
  status: SubscriptionStatus;
  expires_at: string | null;
  stripe_session_id: string | null;
  created_at: string;
  updated_at: string;
  plan?: SubscriptionPlan;
  transactions?: SubscriptionTransaction[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// ─── GET /api/UserSubscription/me ─────────────────────────────────────────────

export const getMySubscription = (signal?: AbortSignal): Promise<ApiResponse<UserSubscription>> => {
  return fetchData<ApiResponse<UserSubscription>>({
    url: '/api/UserSubscription/me',
    method: 'GET',
    signal,
  });
};

export const useGetMySubscription = (options?: {
  query?: Partial<
    UseQueryOptions<
      Awaited<ReturnType<typeof getMySubscription>>,
      unknown,
      Awaited<ReturnType<typeof getMySubscription>>
    >
  >;
}) => {
  return useQuery({
    queryKey: ['/api/UserSubscription/me'],
    queryFn: ({ signal }) => getMySubscription(signal),
    ...options?.query,
  });
};

// ─── GET /api/UserSubscription/plans ──────────────────────────────────────────

export const getSubscriptionPlans = (
  signal?: AbortSignal
): Promise<ApiResponse<SubscriptionPlan[]>> => {
  return fetchData<ApiResponse<SubscriptionPlan[]>>({
    url: '/api/UserSubscription/plans',
    method: 'GET',
    signal,
  });
};

export const useGetSubscriptionPlans = (options?: {
  query?: Partial<
    UseQueryOptions<
      Awaited<ReturnType<typeof getSubscriptionPlans>>,
      unknown,
      Awaited<ReturnType<typeof getSubscriptionPlans>>
    >
  >;
}) => {
  return useQuery({
    queryKey: ['/api/UserSubscription/plans'],
    queryFn: ({ signal }) => getSubscriptionPlans(signal),
    ...options?.query,
  });
};

// ─── POST /api/UserSubscription/subscribe ────────────────────────────────────

export interface SubscribeParams {
  plan_id: number;
  success_url: string;
  cancel_url: string;
}

export interface SubscribeResponse {
  success: boolean;
  data: {
    checkout_url: string | null;
    subscription_id: number;
    session_id: string | null;
    activated?: boolean;
  };
}

export const subscribe = (body: SubscribeParams): Promise<SubscribeResponse> => {
  return fetchData<SubscribeResponse>({
    url: '/api/UserSubscription/subscribe',
    method: 'POST',
    data: body,
  });
};

export const useSubscribe = (
  options?: UseMutationOptions<SubscribeResponse, unknown, SubscribeParams>
) => {
  return useMutation<SubscribeResponse, unknown, SubscribeParams>({
    mutationFn: subscribe,
    ...options,
  });
};

// ─── POST /api/UserSubscription/confirm ──────────────────────────────────────

export interface ConfirmSubscriptionParams {
  session_id: string;
  subscription_id: number;
}

export const confirmSubscription = (
  body: ConfirmSubscriptionParams
): Promise<ApiResponse<UserSubscription>> => {
  return fetchData<ApiResponse<UserSubscription>>({
    url: '/api/UserSubscription/confirm',
    method: 'POST',
    data: body,
  });
};

export const useConfirmSubscription = (
  options?: UseMutationOptions<ApiResponse<UserSubscription>, unknown, ConfirmSubscriptionParams>
) => {
  return useMutation<ApiResponse<UserSubscription>, unknown, ConfirmSubscriptionParams>({
    mutationFn: confirmSubscription,
    ...options,
  });
};

// ─── POST /api/UserSubscription/{id}/renew ───────────────────────────────────

export interface RenewSubscriptionParams {
  id: number;
  success_url: string;
  cancel_url: string;
}

export interface RenewResponse {
  success: boolean;
  data: {
    checkout_url: string | null;
    subscription_id: number;
    session_id: string | null;
    activated?: boolean;
  };
}

export const renewSubscription = ({
  id,
  ...body
}: RenewSubscriptionParams): Promise<RenewResponse> => {
  return fetchData<RenewResponse>({
    url: `/api/UserSubscription/${id}/renew`,
    method: 'POST',
    data: body,
  });
};

export const useRenewSubscription = (
  options?: UseMutationOptions<RenewResponse, unknown, RenewSubscriptionParams>
) => {
  return useMutation<RenewResponse, unknown, RenewSubscriptionParams>({
    mutationFn: renewSubscription,
    ...options,
  });
};

// ─── POST /api/UserSubscription/{id}/confirm-renewal ─────────────────────────

export interface ConfirmRenewalParams {
  id: number;
  session_id: string;
}

export const confirmRenewal = ({
  id,
  ...body
}: ConfirmRenewalParams): Promise<ApiResponse<UserSubscription>> => {
  return fetchData<ApiResponse<UserSubscription>>({
    url: `/api/UserSubscription/${id}/confirm-renewal`,
    method: 'POST',
    data: body,
  });
};

export const useConfirmRenewal = (
  options?: UseMutationOptions<ApiResponse<UserSubscription>, unknown, ConfirmRenewalParams>
) => {
  return useMutation<ApiResponse<UserSubscription>, unknown, ConfirmRenewalParams>({
    mutationFn: confirmRenewal,
    ...options,
  });
};

// ─── POST /api/UserSubscription/{id}/cancel ──────────────────────────────────

export const cancelSubscription = (id: number): Promise<ApiResponse<UserSubscription>> => {
  return fetchData<ApiResponse<UserSubscription>>({
    url: `/api/UserSubscription/${id}/cancel`,
    method: 'POST',
  });
};

export const useCancelSubscription = (
  options?: UseMutationOptions<ApiResponse<UserSubscription>, unknown, number>
) => {
  return useMutation<ApiResponse<UserSubscription>, unknown, number>({
    mutationFn: cancelSubscription,
    ...options,
  });
};

// ─── GET /api/UserSubscription/{id}/transactions ─────────────────────────────

export const getSubscriptionTransactions = (
  id: number,
  signal?: AbortSignal
): Promise<ApiResponse<SubscriptionTransaction[]>> => {
  return fetchData<ApiResponse<SubscriptionTransaction[]>>({
    url: `/api/UserSubscription/${id}/transactions`,
    method: 'GET',
    signal,
  });
};

export const useGetSubscriptionTransactions = (
  id: number,
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof getSubscriptionTransactions>>,
        unknown,
        Awaited<ReturnType<typeof getSubscriptionTransactions>>
      >
    >;
  }
) => {
  return useQuery({
    queryKey: ['/api/UserSubscription/transactions', id],
    queryFn: ({ signal }) => getSubscriptionTransactions(id, signal),
    enabled: id > 0,
    ...options?.query,
  });
};
