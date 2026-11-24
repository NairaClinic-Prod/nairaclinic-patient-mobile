import { PressableScale } from '@/components/shared/pressable-scale';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { ArrowRight, FlaskConical, Pill, type LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';
import type { OrderKind } from '../types';

const CHOICES: { kind: OrderKind; title: string; text: string; icon: LucideIcon }[] = [
  {
    kind: 'lab',
    title: 'Lab test',
    text: 'Book the tests or procedures your doctor requested.',
    icon: FlaskConical,
  },
  {
    kind: 'medication',
    title: 'Prescription · Medicines',
    text: 'Compare pharmacy prices for the medicines on a prescription.',
    icon: Pill,
  },
];

export function ChooseStep({ onChoose }: { onChoose: (kind: OrderKind) => void }) {
  return (
    <View className="gap-3">
      {CHOICES.map(({ kind, title, text, icon }) => (
        <PressableScale
          key={kind}
          scaleTo={0.98}
          role="button"
          onPress={() => onChoose(kind)}
          className="bg-muted border-border flex-row items-center gap-4 rounded-2xl border p-4">
          <View className="bg-card size-12 items-center justify-center rounded-2xl">
            <Icon as={icon} className="text-primary size-6" />
          </View>
          <View className="min-w-0 flex-1 gap-0.5">
            <Text className="text-base font-bold">{title}</Text>
            <Text className="text-muted-foreground text-[13px] leading-5">{text}</Text>
          </View>
          <Icon as={ArrowRight} className="text-muted-foreground size-5" />
        </PressableScale>
      ))}
    </View>
  );
}
