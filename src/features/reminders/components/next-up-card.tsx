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
    <View className="bg-primary flex-row items-center gap-3 rounded-3xl px-4 py-3.5">
      <View className="flex-1">
        <Text className="text-primary-foreground/70 text-[11px] font-semibold">Next reminder</Text>
        <Text className="text-primary-foreground text-2xl font-extrabold">{when}</Text>
        <Text className="text-primary-foreground/90 mt-0.5 text-xs font-medium" numberOfLines={1}>
          {detail ? `${title} · ${detail}` : title}
        </Text>
      </View>
      <View className="size-11 items-center justify-center rounded-full bg-white/15">
        <Icon as={AlarmClock} className="text-primary-foreground size-5" />
      </View>
    </View>
  );
}
