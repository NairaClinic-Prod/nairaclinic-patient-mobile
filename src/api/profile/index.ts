import { useQuery } from '@tanstack/react-query';
import { queryClient } from '../query-client';
import { profileApi } from './endpoint.api';
import { toProfileData, toUpdateBody } from './map';
import type { ProfileData } from './type';

export * from './type';
export { profileApi } from './endpoint.api';
export { PROFILE_ENDPOINTS } from './endpoints';
export { toProfileData, toUpdateBody } from './map';

export const profileKeys = {
  all: ['profile'] as const,
  me: ['profile', 'me'] as const,
};

export const useProfileQuery = () =>
  useQuery({
    queryKey: profileKeys.me,
    queryFn: async () => toProfileData(await profileApi.me()),
    staleTime: 60_000,
  });

// Saves the edited profile, showing it at once and putting the old one back if the server refuses.
export async function saveProfileData(input: ProfileData): Promise<ProfileData> {
  await queryClient.cancelQueries({ queryKey: profileKeys.me });
  const previous = queryClient.getQueryData<ProfileData>(profileKeys.me);
  queryClient.setQueryData(profileKeys.me, input);
  try {
    const updated = toProfileData(await profileApi.update(toUpdateBody(input)));
    queryClient.setQueryData(profileKeys.me, updated);
    return updated;
  } catch (error) {
    queryClient.setQueryData(profileKeys.me, previous);
    throw error;
  } finally {
    queryClient.invalidateQueries({ queryKey: profileKeys.me });
  }
}
