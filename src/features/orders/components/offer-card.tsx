import { PressableScale } from '@/components/shared/pressable-scale';
import { StatusPill } from '@/components/shared/status-pill';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { Check, Clock, MapPin, X } from 'lucide-react-native';
import { View } from 'react-native';
import type { PharmacyOffer, RequestItem } from '../types';
import { distanceLabel, formatNaira, hasLine } from '../utils';

type OfferCardProps = {
  offer: PharmacyOffer;
  items: RequestItem[];
  lowest: boolean;
  picked: boolean;
  disabled: boolean;
  onToggle: () => void;
};

export function OfferCard({ offer, items, lowest, picked, disabled, onToggle }: OfferCardProps) {
  const covers = offer.covers;
  const waiting = covers === 0 && !offer.replied && offer.asked;
  const full = covers === items.length;

  return (
    <PressableScale
      scaleTo={0.985}
      role="checkbox"
      accessibilityState={{ checked: picked, disabled: disabled && !waiting }}
      disabled={disabled && !waiting}
      onPress={onToggle}
      className={cn(
        'gap-3 rounded-2xl border-2 p-4',
        picked ? 'border-primary bg-secondary/40' : 'border-border bg-card',
        disabled && !waiting && 'opacity-60'
      )}>
      <View className="flex-row items-start justify-between gap-3">
        <View className="min-w-0 flex-1 gap-2">
          <View className="flex-row flex-wrap items-center gap-x-2 gap-y-1">
            <Text className="text-[15px] font-bold">{offer.name}</Text>
            {offer.branch ? (
              <View className="border-border rounded-full border px-2 py-0.5">
                <Text className="text-muted-foreground text-[11px] font-medium">
                  {`${offer.branch} branch`}
                </Text>
              </View>
            ) : null}
          </View>
          <View className="flex-row flex-wrap items-center gap-1.5">
            {lowest ? <StatusPill tone="active">Lowest price</StatusPill> : null}
            {waiting ? (
              <StatusPill tone="pending">Waiting for price quote</StatusPill>
            ) : (
              <StatusPill tone={full ? 'active' : 'pending'}>
                {full ? 'Has everything' : `Has ${covers} of ${items.length}`}
              </StatusPill>
            )}
            {offer.replied ? <StatusPill tone="info">Accepted</StatusPill> : null}
          </View>
          {offer.distanceMeters !== null ? (
            <View className="flex-row items-center gap-1">
              <Icon as={MapPin} className="text-muted-foreground size-3" />
              <Text className="text-muted-foreground text-xs">
                {`${distanceLabel(offer.distanceMeters)} away${
                  offer.etaMinutes ? ` · about ${offer.etaMinutes} min` : ''
                }`}
              </Text>
            </View>
          ) : null}
        </View>
        <View
          className={cn(
            'mt-0.5 size-6 items-center justify-center rounded-md border-2',
            picked ? 'border-primary bg-primary' : 'border-muted-foreground/40',
            waiting && 'border-transparent'
          )}>
          {picked ? (
            <Icon as={Check} strokeWidth={3} className="text-primary-foreground size-3.5" />
          ) : waiting ? (
            <Icon as={Clock} className="text-warning size-4" />
          ) : null}
        </View>
      </View>

      <View className="gap-1.5">
        {items.map((item) => {
          const has = hasLine(offer, item);
          const line = offer.lines.find((entry) => entry.itemId === item.id);
          return (
            <View key={item.id} className="flex-row items-center justify-between gap-3">
              <View className="min-w-0 flex-1 flex-row items-center gap-2">
                <Icon
                  as={has ? Check : X}
                  className={cn('size-4', has ? 'text-success' : 'text-muted-foreground')}
                />
                <Text
                  numberOfLines={1}
                  className={cn('flex-1 text-[13px]', !has && 'text-muted-foreground')}>
                  {item.name}
                </Text>
              </View>
              <Text className="text-muted-foreground text-[13px]">
                {has && line?.unitPriceKobo
                  ? `${item.quantity} × ${formatNaira(line.unitPriceKobo)}`
                  : waiting
                    ? 'Waiting for price'
                    : 'Not available'}
              </Text>
            </View>
          );
        })}
      </View>

      {offer.estimatedTotalKobo > 0 ? (
        <View className="border-border gap-0.5 border-t pt-2">
          <View className="flex-row justify-between">
            <Text className="text-muted-foreground text-[13px]">Total for what it has</Text>
            <Text className="text-[13px] font-bold">{formatNaira(offer.estimatedTotalKobo)}</Text>
          </View>
          {offer.deliveryFeeKobo > 0 ? (
            <Text className="text-muted-foreground text-xs">
              {`Includes ${formatNaira(offer.deliveryFeeKobo)} delivery`}
            </Text>
          ) : null}
        </View>
      ) : null}
    </PressableScale>
  );
}
