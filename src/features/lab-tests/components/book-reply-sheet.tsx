import type { LabOption, PriceReply } from '@/api/labs';
import { ActionButton } from '@/components/shared/action-button';
import { Sheet } from '@/components/shared/sheet';
import { Text } from '@/components/ui/text';
import { LabCheckoutStep, useLabCheckout } from '@/features/make-order/steps/lab-checkout';
import { EMPTY_LOCATION } from '@/features/make-order/types';
import { attempt } from '@/features/orders/actions';
import { formatNaira } from '@/features/orders/utils';
import * as React from 'react';
import { Alert, View } from 'react-native';

// A laboratory replied with a price. The patient chooses a time and pays; the price is the one it quoted.
const optionOf = (reply: PriceReply, tests: string[]): LabOption => {
  const [labName, branchName = ''] = reply.lab.split(' · ');
  return {
    id: reply.branchId,
    labName: labName ?? reply.lab,
    branchName,
    address: '',
    distanceKm: null,
    labVisits: true,
    homeCollection: reply.homeCollection,
    homeFeeKobo: 0,
    homeAreas: [],
    turnaroundHours: 0,
    matched: tests.map((requested) => ({ requested, priceKobo: null, testId: null })),
    matchedCount: tests.length,
    subtotalKobo: reply.totalKobo,
  };
};

export function BookReplySheet({
  reply,
  tests,
  collection,
  onClose,
}: {
  reply: PriceReply | null;
  tests: string[];
  collection: 'lab_visit' | 'home';
  onClose: () => void;
}) {
  const lab = React.useMemo(() => (reply ? optionOf(reply, tests) : null), [reply, tests]);
  const checkout = useLabCheckout({
    lab,
    collection,
    location: EMPTY_LOCATION,
    responseId: reply?.id,
  });

  async function pay() {
    const result = await attempt("Couldn't place the booking", () => checkout.submit());
    if (!result) return;
    if (!result.outcome.paid) {
      Alert.alert('Payment not confirmed', result.outcome.message);
      return;
    }
    onClose();
    Alert.alert('Booking confirmed', `${lab?.labName ?? 'The laboratory'} has your booking.`);
  }

  return (
    <Sheet
      open={Boolean(reply)}
      onClose={onClose}
      showClose
      hideFooterWithKeyboard
      divided
      snapPoints={['94%']}
      eyebrow="Lab tests"
      title="Book this lab."
      subtitle="Choose a time and how you want your results."
      footer={
        <View className="gap-3">
          {checkout.problems.length && checkout.priced ? (
            <Text className="text-muted-foreground text-xs">{`Still needed: ${checkout.problems.join(', ')}.`}</Text>
          ) : null}
          <ActionButton
            size="md"
            label={
              checkout.busy
                ? 'Booking…'
                : checkout.priced
                  ? `Pay ${formatNaira(checkout.priced.pricing.totalKobo)}`
                  : 'Pay'
            }
            disabled={checkout.busy || checkout.problems.length > 0}
            onPress={pay}
          />
        </View>
      }>
      {reply ? <LabCheckoutStep checkout={checkout} /> : null}
    </Sheet>
  );
}
