import { Sheet } from '@/components/patterns/sheet';
import { StatusPill } from '@/components/patterns/status-pill';
import { Text } from '@/components/ui/text';
import { View } from 'react-native';
import type { ShoppingRequest } from '../types';
import { formatWhen, medicineLine, plural } from '../utils';

type RequestSheetProps = { request: ShoppingRequest | null; onClose: () => void };

const STATUS = {
  open: { label: 'Waiting for offers', tone: 'info' },
  expired: { label: 'Expired', tone: 'inactive' },
  cancelled: { label: 'Cancelled', tone: 'inactive' },
} as const;

export function RequestSheet({ request, onClose }: RequestSheetProps) {
  const status = request ? STATUS[request.status] : null;

  return (
    <Sheet
      open={Boolean(request)}
      onClose={onClose}
      title="Request details"
      subtitle={request ? `${request.reference} · Requested ${formatWhen(request.createdAt)}` : undefined}>
      {request && status ? (
        <>
          <View className="gap-2">
            <StatusPill tone={request.replies ? 'pending' : status.tone}>
              {request.replies && request.status === 'open'
                ? plural(request.replies, 'offer')
                : status.label}
            </StatusPill>
            <Text className="text-muted-foreground text-xs leading-[18px]">
              {request.status === 'open'
                ? request.waiting
                  ? `${plural(request.waiting, 'pharmacy', 'pharmacies')} asked. They confirm current prices and availability.`
                  : 'Pharmacies confirm current prices and availability.'
                : request.status === 'expired'
                  ? 'No pharmacy replied in time, so this request closed.'
                  : 'You cancelled this request.'}
            </Text>
          </View>
          <View className="bg-muted gap-2.5 rounded-3xl p-4">
            <Text className="text-sm font-bold">Medicines</Text>
            {request.items.map((item) => (
              <Text key={item.name} className="text-[13px] leading-5">
                {medicineLine(item)}
              </Text>
            ))}
          </View>
          <View className="bg-muted gap-1 rounded-3xl p-4">
            <Text className="text-sm font-bold">
              {request.fulfilment === 'delivery' ? 'Home delivery' : 'Pick up'}
            </Text>
            {request.area ? (
              <Text className="text-muted-foreground text-xs">{request.area}</Text>
            ) : null}
          </View>
        </>
      ) : null}
    </Sheet>
  );
}
