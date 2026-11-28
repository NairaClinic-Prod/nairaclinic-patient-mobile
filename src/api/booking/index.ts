import { useQuery } from '@tanstack/react-query';
import { bookingApi, SEARCH_PAGE_SIZE } from './endpoint.api';

export * from './type';
export { bookingApi, SEARCH_PAGE_SIZE } from './endpoint.api';

export const bookingKeys = {
  doctor: (slug: string) => ['booking', 'doctor', slug] as const,
  slots: (slug: string) => ['booking', 'slots', slug] as const,
  search: (query: string) => ['booking', 'search', query] as const,
  profile: ['booking', 'profile'] as const,
  plans: (doctorUserId: string) => ['booking', 'plans', doctorUserId] as const,
};

export const useDoctor = (slug: string | null) =>
  useQuery({
    queryKey: bookingKeys.doctor(slug ?? ''),
    queryFn: () => bookingApi.doctor(slug as string),
    enabled: Boolean(slug),
    staleTime: 60_000,
  });

export const useOpenSlots = (slug: string | null, enabled = true) =>
  useQuery({
    queryKey: bookingKeys.slots(slug ?? ''),
    queryFn: () => bookingApi.slots(slug as string),
    enabled: Boolean(slug) && enabled,
    staleTime: 30_000,
  });

export const useDoctorSearch = (query: string, enabled: boolean) =>
  useQuery({
    queryKey: bookingKeys.search(query),
    queryFn: () => bookingApi.search(query),
    enabled,
    staleTime: 30_000,
  });

export const useSpecialties = () =>
  useQuery({
    queryKey: ['booking', 'specialties'] as const,
    queryFn: bookingApi.specialties,
    staleTime: 10 * 60_000,
  });

export const useBookingTiming = () =>
  useQuery({
    queryKey: ['booking', 'timing'] as const,
    queryFn: bookingApi.timing,
    staleTime: 30_000,
  });

export const useBookingProfile = () =>
  useQuery({ queryKey: bookingKeys.profile, queryFn: bookingApi.profile, staleTime: 60_000 });

export const useMyDoctorPlans = (doctorUserId: string | null) =>
  useQuery({
    queryKey: bookingKeys.plans(doctorUserId ?? ''),
    queryFn: () => bookingApi.doctorPlans(doctorUserId as string),
    enabled: Boolean(doctorUserId),
    staleTime: 30_000,
  });
