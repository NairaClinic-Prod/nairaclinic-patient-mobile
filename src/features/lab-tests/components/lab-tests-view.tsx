import { ActionButton } from '@/components/shared/action-button';
import { Text } from '@/components/ui/text';
import { openMakeOrder } from '@/features/make-order/store';
import { useOrdersData } from '@/features/orders/hooks/use-orders';
import { LabBookingsSection } from '@/features/orders/components/lab-bookings-section';
import { FlaskConical, MessageSquarePlus } from 'lucide-react-native';
import { View } from 'react-native';
import { LAB_REQUESTS } from '../dummy';
import { PriceRequestCard } from './price-request-card';

export function LabTestsView() {
  const { labBookings } = useOrdersData();

  return (
    <View className="gap-7">
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

      <View className="gap-4">
        <Text className="text-base font-extrabold">Price requests</Text>
        {LAB_REQUESTS.length ? (
          <View className="gap-3">
            {LAB_REQUESTS.map((request) => (
              <PriceRequestCard key={request.id} request={request} />
            ))}
          </View>
        ) : (
          <Text className="text-[13px] leading-5 text-muted-foreground">
            Need a test no laboratory lists? Ask for a price and labs in your area will reply.
          </Text>
        )}
      </View>
    </View>
  );
}
