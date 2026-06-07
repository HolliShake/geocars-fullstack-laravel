import {
  useMutation,
  useQuery,
  type UseMutationOptions,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { fetchData } from './axios';

export type UserAccountType = 'GCash' | 'Maya' | 'Bank';

export interface UserAccountOwner {
  id?: number;
  firstname?: string;
  lastname?: string;
  name?: string;
}

export interface UserAccount {
  id?: number;
  user_id: number;
  type: UserAccountType;
  account_number: string;
  expiry?: string | null;
  cvv?: string | null;
  is_default: boolean;
  owner?: UserAccountOwner;
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedUserAccount {
  data: UserAccount[];
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

export interface GetUserAccountPaginatedParams {
  search?: string;
  type?: UserAccountType;
  page?: number;
  rows?: number;
  current_user?: boolean;
}

export const getUserAccountPaginated = (
  params: GetUserAccountPaginatedParams,
  signal?: AbortSignal
): Promise<ApiResponse<PaginatedUserAccount>> => {
  return fetchData<ApiResponse<PaginatedUserAccount>>({
    url: '/api/UserAccount',
    method: 'GET',
    params,
    signal,
  });
};

export const getGetUserAccountPaginatedQueryKey = (params: GetUserAccountPaginatedParams) =>
  ['/api/UserAccount', params] as const;

export const useGetUserAccountPaginated = (
  params: GetUserAccountPaginatedParams,
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof getUserAccountPaginated>>,
        unknown,
        Awaited<ReturnType<typeof getUserAccountPaginated>>
      >
    >;
  }
) => {
  const queryKey = options?.query?.queryKey ?? getGetUserAccountPaginatedQueryKey(params);
  const queryFn = ({ signal }: { signal?: AbortSignal }) => getUserAccountPaginated(params, signal);

  return useQuery({
    queryKey,
    queryFn,
    ...options?.query,
  });
};

export const createUserAccount = (
  data: UserAccount,
  signal?: AbortSignal
): Promise<ApiResponse<UserAccount>> => {
  return fetchData<ApiResponse<UserAccount>>({
    url: '/api/UserAccount',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data,
    signal,
  });
};

export const useCreateUserAccount = (options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof createUserAccount>>,
    unknown,
    { data: UserAccount }
  >;
}) => {
  const mutationFn = ({ data }: { data: UserAccount }) => createUserAccount(data);
  return useMutation({ mutationFn, ...options?.mutation });
};

export const updateUserAccount = (
  id: number,
  data: UserAccount,
  signal?: AbortSignal
): Promise<ApiResponse<UserAccount>> => {
  return fetchData<ApiResponse<UserAccount>>({
    url: `/api/UserAccount/${id}`,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    data,
    signal,
  });
};

export const useUpdateUserAccount = (options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof updateUserAccount>>,
    unknown,
    { id: number; data: UserAccount }
  >;
}) => {
  const mutationFn = ({ id, data }: { id: number; data: UserAccount }) =>
    updateUserAccount(id, data);
  return useMutation({ mutationFn, ...options?.mutation });
};

export const deleteUserAccount = (id: number, signal?: AbortSignal): Promise<ApiResponse<null>> => {
  return fetchData<ApiResponse<null>>({
    url: `/api/UserAccount/${id}`,
    method: 'DELETE',
    signal,
  });
};

export const useDeleteUserAccount = (options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof deleteUserAccount>>,
    unknown,
    { id: number }
  >;
}) => {
  const mutationFn = ({ id }: { id: number }) => deleteUserAccount(id);
  return useMutation({ mutationFn, ...options?.mutation });
};
