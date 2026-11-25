import { ActionButton } from '@/components/shared/action-button';
import { PressableScale } from '@/components/shared/pressable-scale';
import { StatusPill } from '@/components/shared/status-pill';
import { Text } from '@/components/ui/text';
import { formatNaira, plural } from '@/features/orders/utils';
import { View } from 'react-native';
import type { PriceRequest } from '../types';

const DAY_MONTH = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' });

export function PriceRequestCard({ request }: { request: PriceRequest }) {
  const replies = request.replies;

  return (
    <View className="gap-4 rounded-2xl bg-card p-4">
      <View className="flex-row items-start justify-between gap-3">
        <View className="min-w-0 flex-1 gap-1">
          <Text className="text-[15px] leading-5 font-bold">{request.tests.join(', ')}</Text>
          <Text className="text-xs text-muted-foreground">{`${request.reference} · ${request.area}`}</Text>
          <Text className="text-xs text-muted-foreground">
            {`Open until ${DAY_MONTH.format(new Date(request.expiresAt))}`}
          </Text>
        </View>
        <StatusPill tone={replies.length ? 'active' : 'pending'}>
          {replies.length ? plural(replies.length, 'reply', 'replies') : 'Waiting for labs'}
        </StatusPill>
      </View>

      {replies.length ? (
        <View className="gap-2.5">
          {replies.map((reply) => (
            <View key={reply.id} className="gap-3 rounded-xl bg-muted p-3.5">
              <View className="flex-row items-start justify-between gap-3">
                <View className="min-w-0 flex-1 gap-0.5">
                  <Text className="text-[14px] leading-5 font-semibold">{reply.lab}</Text>
                  <Text className="text-xs text-muted-foreground">{reply.note}</Text>
                </View>
                <Text className="text-[15px] font-extrabold">{formatNaira(reply.totalKobo)}</Text>
              </View>
              <ActionButton size="md" label="Book this lab" />
            </View>
          ))}
        </View>
      ) : null}

      <PressableScale scaleTo={0.97} role="button" onPress={() => {}} className="self-start py-1">
        <Text className="text-[13px] font-semibold text-muted-foreground">Close request</Text>
      </PressableScale>
    </View>
  );
}
