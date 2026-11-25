import { ActionButton } from '@/components/shared/action-button';
import { StatusPill } from '@/components/shared/status-pill';
import { Text } from '@/components/ui/text';
import { View } from 'react-native';
import { MEDICINES_SHOWN } from '../constants';
import type { ShoppingRequest } from '../types';
import { formatWhen, medicineLine, plural } from '../utils';

type ClosedRequestCardProps = { request: ShoppingRequest; onOpen: () => void };

export function ClosedRequestCard({ request, onOpen }: ClosedRequestCardProps) {
  const expired = request.status === 'expired';
  const names = request.items.map(medicineLine);

  return (
    <View className="gap-3 rounded-2xl bg-card p-4">
      <View className="gap-1">
        <Text className="text-base leading-5.5 font-bold">
          {`${request.reference} · ${plural(request.items.length, 'medicine')}`}
        </Text>
        <Text className="text-xs text-muted-foreground">
          {`Requested ${formatWhen(request.createdAt)}`}
        </Text>
      </View>
      <StatusPill tone="inactive">{expired ? 'Expired' : 'Cancelled'}</StatusPill>
      <Text className="text-[13px] leading-5">
        {`${names.slice(0, MEDICINES_SHOWN).join(' · ')}${names.length > MEDICINES_SHOWN ? ' …' : ''}`}
      </Text>
      <View className="gap-3 border-t border-border pt-3">
        <Text className="text-[13px] leading-5 text-muted-foreground">
          {expired
            ? 'No pharmacy replied in time, so this request closed. You can make a new order any time.'
            : 'You cancelled this request.'}
        </Text>
        <ActionButton size="md" label="View request" onPress={onOpen} />
      </View>
    </View>
  );
}
