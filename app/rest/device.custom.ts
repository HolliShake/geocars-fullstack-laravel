import { useQuery } from '@tanstack/react-query';
import type { UseQueryOptions } from '@tanstack/react-query';
import { fetchData } from './axios';
import type { DeviceLocation } from './models/deviceLocation';

export interface DeviceWithLocations {
  id?: number;
  device_identifier: string;
  car_rental_id: number;
  latest_location?: DeviceLocation | null;
  locations?: DeviceLocation[];
  created_at?: string;
  updated_at?: string;
}

export interface GetDeviceWithLocationsResponse200 {
  success: boolean;
  data: DeviceWithLocations;
}

export const getDeviceByCarRental = (
  carRentalId: number,
  signal?: AbortSignal,
): Promise<GetDeviceWithLocationsResponse200> => {
  return fetchData<GetDeviceWithLocationsResponse200>({
    url: `/api/Device/ByCarRental/${carRentalId}`,
    method: 'GET',
    signal,
  });
};

export const getGetDeviceByCarRentalQueryKey = (carRentalId: number) =>
  [`/api/Device/ByCarRental/${carRentalId}`] as const;

export const useGetDeviceByCarRental = (
  carRentalId: number,
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof getDeviceByCarRental>>,
        unknown,
        Awaited<ReturnType<typeof getDeviceByCarRental>>
      >
    >;
  },
) => {
  const queryKey = options?.query?.queryKey ?? getGetDeviceByCarRentalQueryKey(carRentalId);

  const queryFn = ({ signal }: { signal?: AbortSignal }) =>
    getDeviceByCarRental(carRentalId, signal);

  return useQuery({
    queryKey,
    queryFn,
    enabled: !!(carRentalId),
    ...options?.query,
  });
};
