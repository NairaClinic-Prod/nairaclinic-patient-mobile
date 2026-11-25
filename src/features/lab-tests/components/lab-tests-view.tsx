import { ActionButton } from '@/components/shared/action-button';
import { Text } from '@/components/ui/text';
import { openMakeOrder } from '@/features/make-order/store';
import { useOrdersData } from '@/features/orders/hooks/use-orders';
import { LabBookingsSection } from '@/features/orders/components/lab-bookings-section';
import { formatDay, formatNaira, plural } from '@/features/orders/utils';
import { StatusPill } from '@/components/shared/status-pill';
import { FlaskConical, MessageSquarePlus } from 'lucide-react-native';
import { View } from 'react-native';
import { LAB_REQUESTS } from '../dummy';

export function LabTestsView() {
  const { labBookings } = useOrdersData();

  return (
    <View className="gap-6">
      <View className="flex-row gap-2">
        <ActionButton
          size="md"
          variant="outline"
          icon={MessageSquarePlus}
          label="Ask for a price"
          className="flex-1"
        />
        <ActionButton
          size="md"
          icon={FlaskConical}
          label="Order a lab test"
          className="flex-1"
          onPress={() => openMakeOrder({ kind: 'lab' })}
        />
      </View>

      <LabBookingsSection bookings={labBookings} title="Your lab bookings" limit={20} />

      <View className="gap-3">
        <Text className="text-base font-extrabold">Price requests</Text>
        {LAB_REQUESTS.length ? (
          LAB_REQUESTS.map((request) => (
            <View key={request.id} className="gap-3 rounded-2xl bg-card p-4">
              <View className="flex-row items-start justify-between gap-3">
                <View className="min-w-0 flex-1 gap-0.5">
                  <Text className="text-[14px] leading-5 font-bold">
                    {request.tests.join(', ')}
                  </Text>
                  <Text className="text-xs leading-4.5 text-muted-foreground">
                    {`${request.reference} · ${request.area} · replies until ${formatDay(request.expiresAt)}`}
                  </Text>
                </View>
                <StatusPill tone={request.replies.length ? 'active' : 'pending'}>
                  {request.replies.length
                    ? plural(request.replies.length, 'reply', 'replies')
                    : 'Waiting for labs'}
                </StatusPill>
              </View>
              {request.replies.map((reply) => (
                <View key={reply.id} className="gap-2 border-t border-border pt-3">
                  <View className="flex-row items-center justify-between gap-3">
                    <View className="min-w-0 flex-1">
                      <Text className="text-[13px] font-semibold" numberOfLines={1}>
                        {reply.lab}
                      </Text>
                      <Text className="text-xs text-muted-foreground">{reply.note}</Text>
                    </View>
                    <Text className="text-[14px] font-extrabold">
                      {formatNaira(reply.totalKobo)}
                    </Text>
                  </View>
                  <ActionButton size="md" label="Book this lab" />
                </View>
              ))}
              <ActionButton variant="ghost" label="Close request" className="self-start" />
            </View>
          ))
        ) : (
          <Text className="text-[13px] leading-5 text-muted-foreground">
            Need a test no laboratory lists? Ask for a price and labs in your area will reply.
          </Text>
        )}
      </View>
    </View>
  );
}
