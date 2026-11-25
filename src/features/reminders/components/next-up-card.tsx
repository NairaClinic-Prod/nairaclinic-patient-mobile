import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { AlarmClock } from 'lucide-react-native';
import { View } from 'react-native';

type NextUpCardProps = {
  when: string;
  title: string;
  detail: string;
};

export function NextUpCard({ when, title, detail }: NextUpCardProps) {
  return (
    <View className="flex-row items-center gap-3 rounded-3xl bg-primary px-4 py-3.5">
      <View className="flex-1">
        <Text className="text-[11px] font-semibold text-primary-foreground/70">Next reminder</Text>
        <Text className="text-2xl font-extrabold text-primary-foreground">{when}</Text>
        <Text className="mt-0.5 text-xs font-medium text-primary-foreground/90" numberOfLines={1}>
          {detail ? `${title} · ${detail}` : title}
        </Text>
      </View>
      <View className="size-11 items-center justify-center rounded-full bg-white/15">
        <Icon as={AlarmClock} className="size-5 text-primary-foreground" />
      </View>
    </View>
  );
}
