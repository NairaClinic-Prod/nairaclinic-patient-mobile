import { SectionHeader } from '@/components/patterns/section-header';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { SCREEN_PADDING_X } from '@/constants/ui';
import { Check } from 'lucide-react-native';
import { View } from 'react-native';

export function HealthTips({ tips }: { tips: string[] }) {
  if (!tips.length) return null;

  return (
    <View className="gap-4">
      <SectionHeader title="Small steps, better health" />
      <View
        className="bg-card gap-2.5 rounded-2xl p-4"
        style={{ marginHorizontal: SCREEN_PADDING_X }}>
        {tips.map((tip) => (
          <View key={tip} className="flex-row items-start gap-2.5">
            <View className="bg-secondary mt-0.5 size-5 items-center justify-center rounded-full">
              <Icon as={Check} className="text-success size-3" />
            </View>
            <Text className="flex-1 text-xs leading-[18px]">{tip}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
