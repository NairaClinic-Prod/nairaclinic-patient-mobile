import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Check } from 'lucide-react-native';
import { View } from 'react-native';
import type { OrderKind } from '../types';

type SentStepProps = {
  kind: OrderKind;
  mode: 'all' | 'ask' | 'order';
  name: string | null;
  reference: string;
};

export function SentStep({ kind, mode, name, reference }: SentStepProps) {
  const lab = kind === 'lab';
  const who = lab ? 'laboratories' : 'pharmacies';
  const title = mode === 'order' ? (lab ? 'Booking requested' : 'Order placed') : 'Request sent';
  const text =
    mode === 'all'
      ? `Sent to every nearby ${who === 'pharmacies' ? 'pharmacy' : 'laboratory'} around you. The first one to accept takes your request and sends its price.`
      : mode === 'ask'
        ? `${name ?? 'The pharmacy'} will send you an itemised price.`
        : lab
          ? `${name ?? 'The laboratory'} will confirm your booking and send you a time.`
          : `${name ?? 'The pharmacy'} will accept or reject your order. If it rejects, you are refunded in full.`;

  return (
    <View className="items-center gap-3 pt-6 pb-2">
      <View className="size-16 items-center justify-center rounded-full bg-primary">
        <Icon as={Check} strokeWidth={2.5} className="size-8 text-primary-foreground" />
      </View>
      <Text className="text-[22px] font-extrabold tracking-tight">{title}</Text>
      <Text className="max-w-xs text-center text-[13px] leading-5 text-muted-foreground">
        {`${text}${mode === 'order' ? '' : ' You only pay once you accept the price.'}`}
      </Text>
      <Text className="text-xs text-muted-foreground">{reference}</Text>
    </View>
  );
}
