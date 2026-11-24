import { Text } from '@/components/ui/text';
import { View } from 'react-native';

type ReminderStatsProps = {
  active: number;
  paused: number;
  next: string | null;
  nextTitle?: string;
};

export function ReminderStats({ active, paused, next, nextTitle }: ReminderStatsProps) {
  return (
    <View className="flex-row gap-2">
      <View className="bg-secondary flex-1 rounded-2xl p-3">
        <Text className="text-secondary-foreground text-[11px] font-semibold">Active</Text>
        <Text className="text-secondary-foreground mt-1 text-xl font-extrabold">{active}</Text>
      </View>
      <View className="bg-card flex-1 rounded-2xl p-3">
        <Text className="text-muted-foreground text-[11px] font-semibold">Paused</Text>
        <Text className="mt-1 text-xl font-extrabold">{paused}</Text>
      </View>
      <View className="bg-primary flex-[1.4] rounded-2xl p-3">
        <Text className="text-primary-foreground/70 text-[11px] font-semibold">Next</Text>
        <Text className="text-primary-foreground mt-1 text-base font-extrabold" numberOfLines={1}>
          {next ?? '—'}
        </Text>
        {nextTitle ? (
          <Text className="text-primary-foreground/80 text-[11px]" numberOfLines={1}>
            {nextTitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
