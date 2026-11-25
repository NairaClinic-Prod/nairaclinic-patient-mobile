import { PressableScale } from '@/components/shared/pressable-scale';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { drName } from '@/features/home/utils';
import { BadgeCheck, ChevronRight, Star } from 'lucide-react-native';
import { View } from 'react-native';
import type { DoctorSummary } from '../types';
import { DoctorAvatar } from './doctor-avatar';

export function DoctorCard({ doctor, onPress }: { doctor: DoctorSummary; onPress: () => void }) {
  return (
    <PressableScale
      scaleTo={0.985}
      role="button"
      accessibilityLabel={`${drName(doctor.name)}, ${doctor.specialty}`}
      onPress={onPress}
      className="flex-row items-center gap-3.5 rounded-2xl bg-card p-3.5">
      <DoctorAvatar name={doctor.name} online={Boolean(doctor.isOnline)} />
      <View className="min-w-0 flex-1 gap-0.5">
        <View className="flex-row items-center gap-1.5">
          <Text className="shrink text-[15px] font-bold" numberOfLines={1}>
            {drName(doctor.name)}
          </Text>
          <Icon as={BadgeCheck} className="size-4 fill-primary text-card" />
        </View>
        <Text className="text-[13px] text-muted-foreground" numberOfLines={1}>
          {doctor.specialty}
        </Text>
        <View className="mt-1 flex-row items-center gap-3">
          {doctor.rating ? (
            <View className="flex-row items-center gap-1">
              <Icon as={Star} className="size-3.5 fill-warning text-warning" />
              <Text className="text-xs font-medium">{doctor.rating.toFixed(1)}</Text>
            </View>
          ) : null}
          <Text className="shrink text-xs text-muted-foreground" numberOfLines={1}>
            {doctor.languages.slice(0, 3).join(' · ')}
          </Text>
        </View>
      </View>
      <Icon as={ChevronRight} className="size-4 text-muted-foreground" />
    </PressableScale>
  );
}
