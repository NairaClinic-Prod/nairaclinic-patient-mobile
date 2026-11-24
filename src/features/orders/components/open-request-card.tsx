import { ActionButton } from '@/components/shared/action-button';
import { StatusPill } from '@/components/shared/status-pill';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Building2, ChevronDown, Lock, Package } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, View } from 'react-native';
import { MEDICINES_SHOWN } from '../constants';
import type { ShoppingRequest } from '../types';
import { formatWhen, medicineLine, plural } from '../utils';

const OPEN_ITEM = ['open', 'available', 'pending'];

type OpenRequestCardProps = {
  request: ShoppingRequest;
  onOpen: () => void;
  onCancel: () => void;
};

export function OpenRequestCard({ request, onOpen, onCancel }: OpenRequestCardProps) {
  const [expanded, setExpanded] = React.useState(false);
  const [confirming, setConfirming] = React.useState(false);

  const left = request.items.filter((item) => OPEN_ITEM.includes(item.status));
  const ordered = request.items.filter((item) => item.status === 'ordered').length;
  const names = left.map(medicineLine);
  const shown = expanded ? names : names.slice(0, MEDICINES_SHOWN);

  const note = ordered
    ? `${ordered} of ${ordered + left.length} ordered · choose a pharmacy for ${left.length === 1 ? 'the last one' : `the other ${left.length}`}`
    : request.replies
      ? 'Pharmacies replied · choose one'
      : request.waiting
        ? `${plural(request.waiting, 'pharmacy', 'pharmacies')} asked. They confirm current prices and availability.`
        : 'Pharmacies confirm current prices and availability.';

  return (
    <View className="bg-card gap-3 rounded-2xl p-4">
      <View className="gap-1">
        <Text className="text-base leading-5.5 font-bold">
          {`${request.reference} · ${plural(left.length, 'medicine')}`}
        </Text>
        <Text className="text-muted-foreground text-xs">
          {`Requested ${formatWhen(request.createdAt)}`}
        </Text>
      </View>
      <StatusPill tone={request.replies ? 'pending' : 'info'}>
        {request.replies
          ? plural(request.replies, 'offer')
          : ordered
            ? 'Partly ordered'
            : 'Waiting for offers'}
      </StatusPill>
      <View className="gap-1.5">
        <Text className="text-[13px] leading-5">
          {`${shown.join(' · ')}${!expanded && names.length > MEDICINES_SHOWN ? ' …' : ''}`}
        </Text>
        {names.length > MEDICINES_SHOWN ? (
          <Pressable
            role="button"
            accessibilityState={{ expanded }}
            onPress={() => setExpanded((current) => !current)}
            className="flex-row items-center gap-1 self-start active:opacity-60">
            <Text className="text-primary text-[13px] font-semibold">
              {expanded ? 'Show less' : `Show all ${names.length} medicines`}
            </Text>
            <View style={{ transform: [{ rotate: expanded ? '180deg' : '0deg' }] }}>
              <Icon as={ChevronDown} className="text-primary size-3.5" />
            </View>
          </Pressable>
        ) : null}
      </View>
      <View className="flex-row items-center gap-x-4">
        {request.area ? (
          <View className="min-w-0 shrink flex-row items-center gap-1">
            <Icon as={Building2} className="text-muted-foreground size-3.5" />
            <Text className="text-muted-foreground shrink text-[11px]" numberOfLines={1}>
              {request.area}
            </Text>
          </View>
        ) : null}
        <View className="flex-row items-center gap-1">
          <Icon as={Package} className="text-muted-foreground size-3.5" />
          <Text className="text-muted-foreground text-[11px]">
            {request.fulfilment === 'delivery' ? 'Home delivery' : 'Pick up'}
          </Text>
        </View>
        <View className="flex-row items-center gap-1">
          <Icon as={Lock} className="text-muted-foreground size-3.5" />
          <Text className="text-muted-foreground text-[11px]">No payment yet</Text>
        </View>
      </View>
      <View className="border-border gap-3 border-t pt-3">
        <Text className="text-primary text-[13px] leading-5">{note}</Text>
        {confirming ? (
          <View className="gap-2.5">
            <Text className="text-[13px] font-semibold">Cancel this whole request?</Text>
            <View className="flex-row gap-2">
              <ActionButton
                size="md"
                label="Keep it"
                variant="outline"
                className="flex-1"
                onPress={() => setConfirming(false)}
              />
              <ActionButton
                size="md"
                label="Yes, cancel"
                variant="danger"
                className="flex-1"
                onPress={onCancel}
              />
            </View>
          </View>
        ) : (
          <View className="flex-row gap-2">
            <ActionButton
              size="md"
              label={request.replies ? 'Compare offers' : 'View request'}
              className="flex-[3]"
              onPress={onOpen}
            />
            {ordered === 0 ? (
              <ActionButton
                size="md"
                label="Cancel request"
                variant="outline"
                className="flex-[2]"
                onPress={() => setConfirming(true)}
              />
            ) : null}
          </View>
        )}
      </View>
    </View>
  );
}
