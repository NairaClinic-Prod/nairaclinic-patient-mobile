import { ActionButton } from '@/components/patterns/action-button';
import { StatusPill } from '@/components/patterns/status-pill';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Lock, MapPin, Pill, Truck } from 'lucide-react-native';
import { View } from 'react-native';
import type { PharmacyOrder } from '../types';
import {
  formatWhen,
  orderStatusLabel,
  orderTone,
  paymentLabel,
  primaryLabel,
  statusLine,
} from '../utils';

type OrderCardProps = {
  order: PharmacyOrder;
  onOpen: () => void;
  onCancel: () => void;
};

export function OrderCard({ order, onOpen, onCancel }: OrderCardProps) {
  const place = [order.deliveryArea, order.pharmacyState].filter(Boolean).join(', ');

  return (
    <View className="bg-card gap-3 rounded-2xl p-4">
      <View className="flex-row gap-3">
        <View className="bg-secondary size-10 items-center justify-center rounded-full">
          <Icon as={Pill} className="text-primary size-5" />
        </View>
        <View className="min-w-0 flex-1 gap-1.5">
          <StatusPill tone={orderTone(order.status)}>{orderStatusLabel(order)}</StatusPill>
          <Text className="text-[15px] font-bold leading-5">
            {order.items.map((item) => item.name).join(', ')}
          </Text>
          <Text className="text-[13px]">{statusLine(order)}</Text>
          <Text className="text-muted-foreground text-xs leading-[18px]">
            {`${order.reference} · ${order.pharmacyName} · ${formatWhen(order.createdAt)}`}
          </Text>
        </View>
      </View>
      <View className="flex-row flex-wrap gap-x-4 gap-y-1.5">
        {place ? (
          <View className="flex-row items-center gap-1.5">
            <Icon as={MapPin} className="text-muted-foreground size-3.5" />
            <Text className="text-muted-foreground text-xs">{place}</Text>
          </View>
        ) : null}
        <View className="flex-row items-center gap-1.5">
          <Icon as={Truck} className="text-muted-foreground size-3.5" />
          <Text className="text-muted-foreground text-xs">
            {order.fulfilment === 'delivery' ? 'Home delivery' : 'Pick up'}
          </Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <Icon as={Lock} className="text-muted-foreground size-3.5" />
          <Text className="text-muted-foreground text-xs">{paymentLabel(order)}</Text>
        </View>
      </View>
      <View className="flex-row gap-2">
        <ActionButton
          size="md"
          label={primaryLabel(order)}
          onPress={onOpen}
          className="flex-[3]"
        />
        {order.cancellable ? (
          <ActionButton
            size="md"
            label="Cancel request"
            variant="outline"
            onPress={onCancel}
            className="flex-[2]"
          />
        ) : null}
      </View>
    </View>
  );
}
