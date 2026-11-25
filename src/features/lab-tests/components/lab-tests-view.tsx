import { closeRequest, type PriceReply, type PriceRequest } from '@/api/labs';
import { ActionButton } from '@/components/shared/action-button';
import { Text } from '@/components/ui/text';
import { openMakeOrder } from '@/features/make-order/store';
import { LabBookingsSection } from '@/features/orders/components/lab-bookings-section';
import { attempt } from '@/features/orders/actions';
import { useOrdersData } from '@/features/orders/hooks/use-orders';
import { useLabRequestsQuery } from '@/api/labs';
import { FlaskConical, MessageSquarePlus } from 'lucide-react-native';
import * as React from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';
import { AskPriceSheet } from './ask-price-sheet';
import { BookReplySheet } from './book-reply-sheet';
import { PriceRequestCard } from './price-request-card';

export function LabTestsView() {
  const { labBookings } = useOrdersData();
  const requests = useLabRequestsQuery();
  const [asking, setAsking] = React.useState(false);
  const [booking, setBooking] = React.useState<{ reply: PriceReply; request: PriceRequest } | null>(
    null
  );
  const list = requests.data ?? [];

  return (
    <View className="gap-7">
      <View className="flex-row gap-2">
        <ActionButton
          size="md"
          variant="outline"
          icon={MessageSquarePlus}
          label="Ask for a price"
          className="flex-1"
          onPress={() => setAsking(true)}
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

      <View className="gap-4">
        <Text className="text-base font-extrabold">Price requests</Text>
        {requests.isPending ? (
          <ActivityIndicator />
        ) : list.length ? (
          <View className="gap-3">
            {list.map((request) => (
              <PriceRequestCard
                key={request.id}
                request={request}
                onBook={(reply) => setBooking({ reply, request })}
                onClose={() =>
                  Alert.alert('Close this request?', 'Laboratories will stop replying to it.', [
                    { text: 'Keep it', style: 'cancel' },
                    {
                      text: 'Close request',
                      style: 'destructive',
                      onPress: () =>
                        attempt("Couldn't close the request", () => closeRequest(request.id)),
                    },
                  ])
                }
              />
            ))}
          </View>
        ) : (
          <Text className="text-muted-foreground text-[13px] leading-5">
            Need a test no laboratory lists? Ask for a price and labs in your area will reply.
          </Text>
        )}
      </View>

      <AskPriceSheet open={asking} onClose={() => setAsking(false)} />
      <BookReplySheet
        reply={booking?.reply ?? null}
        tests={booking?.request.tests ?? []}
        collection={booking?.request.collection ?? 'lab_visit'}
        onClose={() => setBooking(null)}
      />
    </View>
  );
}
