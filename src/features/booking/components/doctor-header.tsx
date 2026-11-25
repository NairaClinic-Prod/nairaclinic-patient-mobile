import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { drName } from '@/features/home/utils';
import { BadgeCheck, MapPin, Star } from 'lucide-react-native';
import { View } from 'react-native';
import type { DoctorProfile } from '../types';
import { DoctorAvatar } from './doctor-avatar';

export function DoctorHeader({ doctor }: { doctor: DoctorProfile }) {
  return (
    <View className="gap-4 rounded-2xl bg-card p-4">
      <View className="flex-row items-center gap-3.5">
        <DoctorAvatar name={doctor.name} size={64} online={doctor.isOnline} />
        <View className="min-w-0 flex-1 gap-0.5">
          <View className="flex-row items-center gap-1.5">
            <Text className="shrink text-lg font-extrabold tracking-tight" numberOfLines={1}>
              {drName(doctor.name)}
            </Text>
            <Icon as={BadgeCheck} className="size-5 fill-primary text-card" />
          </View>
          <Text className="text-[13px] text-muted-foreground">{doctor.specialty}</Text>
          <View className="mt-1 flex-row items-center gap-3">
            {doctor.rating ? (
              <View className="flex-row items-center gap-1">
                <Icon as={Star} className="size-3.5 fill-warning text-warning" />
                <Text className="text-xs font-semibold">{doctor.rating.toFixed(1)}</Text>
                <Text className="text-xs text-muted-foreground">{`(${doctor.ratingCount})`}</Text>
              </View>
            ) : null}
            <Text className="shrink text-xs text-muted-foreground" numberOfLines={1}>
              {doctor.languages.slice(0, 2).join(' · ')}
            </Text>
          </View>
        </View>
      </View>
      {doctor.bio ? (
        <Text className="text-[13px] leading-5 text-muted-foreground">{doctor.bio}</Text>
      ) : null}
      {doctor.workplace ? (
        <View className="flex-row items-center gap-1.5">
          <Icon as={MapPin} className="size-3.5 text-muted-foreground" />
          <Text className="text-xs text-muted-foreground">{doctor.workplace}</Text>
        </View>
      ) : null}
    </View>
  );
}
