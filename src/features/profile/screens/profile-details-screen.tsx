import { Redirect, useLocalSearchParams } from 'expo-router';
import { ProfileForm } from '../components/profile-form';
import { DETAIL_COPY } from '../constants';
import type { ProfileDetailSection } from '../types';

const isSection = (value: unknown): value is ProfileDetailSection =>
  typeof value === 'string' && value in DETAIL_COPY;

export function ProfileDetailsScreen() {
  const { section } = useLocalSearchParams<{ section: string }>();

  if (!isSection(section)) return <Redirect href="/profile" />;
  return <ProfileForm key={section} section={section} />;
}
