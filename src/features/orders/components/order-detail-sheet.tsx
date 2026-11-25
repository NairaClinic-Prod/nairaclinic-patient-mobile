import { ActionButton } from '@/components/shared/action-button';
import { ButtonRow } from '@/components/shared/button-row';
import { Sheet } from '@/components/shared/sheet';
import { StatusPill } from '@/components/shared/status-pill';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { Check, ExternalLink, MapPin, Package, Phone, Truck } from 'lucide-react-native';
import * as React from 'react';
import { Linking, View } from 'react-native';
import type { OrderStatus, PharmacyOrder } from '../types';
import { formatNaira, formatWhen, orderStatusLabel, orderTone } from '../utils';

const EYEBROW: Record<OrderStatus, string> = {
  new: 'No payment until you choose',
  quoted: 'Pay only if the price suits you',
  accepted: 'Paid · waiting for the pharmacy',
  preparing: 'Track your order',
  ready: 'Track your order',
  completed: 'Collected',
  declined: 'Not fulfilled',
  cancelled: 'Cancelled',
};

const STEP_AT: Record<number, OrderStatus> = {
  0: 'new',
  1: 'quoted',
  2: 'accepted',
  3: 'preparing',
  5: 'ready',
  6: 'completed',
};

const CURRENT: Record<OrderStatus, number> = {
  new: 1,
  quoted: 2,
  accepted: 3,
  preparing: 4,
  ready: 5,
  completed: 7,
  declined: 0,
  cancelled: 0,
};

function Steps({ order }: { order: PharmacyOrder }) {
  const labels = [
    'Request sent',
    'Price from pharmacy',
    'Payment confirmed',
    'Pharmacy accepted',
    'Preparing medicines',
    order.fulfilment === 'delivery' ? 'Ready for dispatch' : 'Ready for pickup',
    'Completed',
  ];
  const current = CURRENT[order.status];

  return (
    <View>
      {labels.map((label, index) => {
        const done = index < current;
        const active = index === current;
        const entry = order.timeline.find((item) => item.status === STEP_AT[index]);
        const last = index === labels.length - 1;
        return (
          <View key={label} className="flex-row gap-3">
            <View className="items-center">
              <View
                className={cn(
                  'size-7 items-center justify-center rounded-full border',
                  done || active ? 'border-primary/30 bg-secondary' : 'bg-muted border-transparent'
                )}>
                {done ? (
                  <Icon as={Check} strokeWidth={3} className="text-primary size-3.5" />
                ) : (
                  <Text
                    className={cn(
                      'text-[11px] font-bold',
                      active ? 'text-primary' : 'text-muted-foreground'
                    )}>
                    {index + 1}
                  </Text>
                )}
              </View>
              {last ? null : (
                <View className={cn('w-px flex-1', done ? 'bg-primary/30' : 'bg-border')} />
              )}
            </View>
            <View className={cn('min-w-0 flex-1 gap-0.5', last ? 'pb-0' : 'pb-5')}>
              <Text
                className={cn(
                  'text-[14px] leading-7 font-semibold',
                  !done && !active && 'text-muted-foreground font-medium'
                )}>
                {label}
              </Text>
              {entry && (done || active) ? (
                <Text className="text-muted-foreground -mt-1 text-xs">{formatWhen(entry.at)}</Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

type RowProps = { label: string; value: string; big?: boolean };

function Row({ label, value, big }: RowProps) {
  return (
    <View className="flex-row items-baseline justify-between gap-3">
      <Text className={cn(big ? 'text-base font-bold' : 'text-muted-foreground text-[13px]')}>
        {label}
      </Text>
      <Text className={cn(big ? 'text-xl font-extrabold' : 'text-[13px] font-semibold')}>
        {value}
      </Text>
    </View>
  );
}

type OrderDetailSheetProps = {
  order: PharmacyOrder | null;
  startCancelling: boolean;
  onClose: () => void;
  onCancel: (id: string) => void;
  onPay?: (id: string) => void;
  busy?: boolean;
};

export function OrderDetailSheet({
  order,
  startCancelling,
  onClose,
  onCancel,
  onPay,
  busy,
}: OrderDetailSheetProps) {
  const [confirming, setConfirming] = React.useState(startCancelling);

  React.useEffect(() => {
    setConfirming(startCancelling);
  }, [startCancelling, order?.id]);

  const closedOut = order ? order.status === 'declined' || order.status === 'cancelled' : false;
  const delivery = order?.fulfilment === 'delivery';
  const canPay = order ? order.status === 'quoted' && order.totalKobo !== null : false;
  const where = order
    ? [order.pharmacyName, order.pharmacyAddress, order.pharmacyState].filter(Boolean).join(', ')
    : '';

  const footer = order ? (
    <View className="gap-3">
      {confirming ? (
        <View className="gap-3">
          <Text className="text-[13px] leading-5">
            {`Cancel ${order.reference}? ${
              order.paid
                ? 'The pharmacy hasn’t started it, so the full amount goes straight to your NairaClinic wallet.'
                : 'The pharmacy will stop working on it.'
            }`}
          </Text>
          <View className="flex-row gap-2">
            <ActionButton
              size="md"
              variant="outline"
              label="Keep order"
              className="flex-1"
              onPress={() => setConfirming(false)}
            />
            <ActionButton
              size="md"
              variant="danger"
              label="Cancel order"
              className="flex-1"
              disabled={busy}
              onPress={() => {
                onCancel(order.id);
                onClose();
              }}
            />
          </View>
        </View>
      ) : (
        <>
          <Text className="text-muted-foreground text-xs leading-4.5">
            {order.status === 'quoted'
              ? 'Prices are held for 48 hours.'
              : order.status === 'new'
                ? 'Pharmacies confirm current prices and availability.'
                : 'Clinical dispensing review is completed by the pharmacy.'}
          </Text>
          <ButtonRow>
            {order.cancellable ? (
              <ActionButton
                size="md"
                variant="outline"
                label={order.status === 'new' ? 'Cancel request' : 'Cancel order'}
                onPress={() => setConfirming(true)}
              />
            ) : null}
            <ActionButton size="md" variant="outline" label="Close" onPress={onClose} />
            {canPay ? (
              <ActionButton
                size="md"
                label={busy ? 'Paying…' : `Pay ${formatNaira(order.totalKobo ?? 0)}`}
                disabled={busy}
                onPress={() => onPay?.(order.id)}
              />
            ) : null}
          </ButtonRow>
        </>
      )}
    </View>
  ) : undefined;

  return (
    <Sheet
      open={Boolean(order)}
      onClose={onClose}
      showClose
      divided
      snapPoints={['92%']}
      eyebrow={order ? EYEBROW[order.status] : undefined}
      title="Your medicine order."
      footer={footer}>
      {order ? (
        <>
          <View className="flex-row flex-wrap items-center gap-2">
            <StatusPill tone={orderTone(order.status)}>{orderStatusLabel(order)}</StatusPill>
            <View className="border-border rounded-full border px-2.5 py-1">
              <Text className="text-muted-foreground text-[11px] font-bold">{order.reference}</Text>
            </View>
          </View>
          <Text className="text-muted-foreground text-[13px] leading-5">{where}</Text>

          {order.collectionCode ? (
            <View className="border-primary/30 bg-secondary/50 items-center gap-1.5 rounded-2xl border border-dashed px-4 py-5">
              <Text className="text-muted-foreground text-[13px]">
                {delivery ? 'Your delivery confirmation code' : 'Your pickup confirmation code'}
              </Text>
              <Text className="text-primary text-[40px] leading-[48px] font-extrabold tracking-[10px]">
                {order.collectionCode}
              </Text>
              <Text className="text-muted-foreground text-center text-xs leading-4.5">
                {delivery
                  ? 'Give this to the rider only when your order arrives.'
                  : 'Share this code only when you have received your medicines.'}
              </Text>
            </View>
          ) : null}

          {order.deliveryStatus ? (
            <View className="border-border flex-row items-center gap-3 rounded-2xl border p-3.5">
              <Icon as={Truck} className="text-primary size-5" />
              <View className="flex-1 gap-0.5">
                <Text className="text-[13px] font-bold">Delivery</Text>
                <Text className="text-muted-foreground text-xs">{order.deliveryStatus}</Text>
                {order.etaText ? (
                  <Text className="text-primary text-xs font-semibold">{order.etaText}</Text>
                ) : null}
                {order.rider?.name ? (
                  <Text className="text-muted-foreground text-xs">
                    {`Rider: ${[order.rider.name, order.rider.phone].filter(Boolean).join(' · ')}`}
                  </Text>
                ) : null}
              </View>
              {order.trackingUrl ? (
                <ActionButton
                  size="md"
                  variant="outline"
                  icon={ExternalLink}
                  label="Track"
                  onPress={() => Linking.openURL(order.trackingUrl as string)}
                />
              ) : null}
            </View>
          ) : null}

          <View className="border-border bg-secondary/30 gap-2.5 rounded-2xl border p-4">
            {order.items.map((item) => (
              <Row
                key={item.id}
                label={`${item.name}${item.strength ? ` ${item.strength}` : ''} × ${item.quantity}`}
                value={item.unitPriceKobo ? formatNaira(item.unitPriceKobo * item.quantity) : '—'}
              />
            ))}
            {order.totalKobo !== null ? (
              <>
                {delivery ? (
                  <Row label="Delivery fee" value={formatNaira(order.deliveryFeeKobo)} />
                ) : null}
                {order.serviceFeeKobo > 0 ? (
                  <Row label="Service fee" value={formatNaira(order.serviceFeeKobo)} />
                ) : null}
                <View className="bg-border my-1 h-px" />
                <Row
                  big
                  label={order.paid ? 'Paid total' : 'Total'}
                  value={formatNaira(order.totalKobo)}
                />
              </>
            ) : null}
          </View>

          <View className="gap-1.5">
            {order.contactName || order.contactPhone ? (
              <Text className="text-muted-foreground text-[13px]">
                {[order.contactName, order.contactPhone].filter(Boolean).join(' · ')}
              </Text>
            ) : null}
            <View className="flex-row items-start gap-2">
              <Icon
                as={delivery ? Package : MapPin}
                className="text-muted-foreground mt-0.5 size-4"
              />
              <Text className="text-muted-foreground flex-1 text-[13px] leading-5">
                {delivery
                  ? `Delivery to ${order.deliveryAddress ?? order.deliveryArea ?? 'your address'}`
                  : `Pickup at ${[order.pharmacyAddress, order.pharmacyState].filter(Boolean).join(', ')}`}
              </Text>
            </View>
            {order.pharmacyPhone && order.paid ? (
              <View className="flex-row items-center gap-2">
                <Icon as={Phone} className="text-primary size-4" />
                <Text className="text-primary text-[13px] font-semibold">
                  {order.pharmacyPhone}
                </Text>
              </View>
            ) : null}
          </View>

          {closedOut ? (
            <View className="bg-muted gap-1 rounded-2xl p-4">
              <Text className="text-[13px] font-bold">
                {order.status === 'declined'
                  ? 'The pharmacy declined this order'
                  : 'You cancelled this request'}
              </Text>
              <Text className="text-muted-foreground text-xs leading-4.5">
                {order.status === 'declined'
                  ? (order.declineReason ?? 'No reason given.')
                  : 'No payment was taken.'}
              </Text>
            </View>
          ) : (
            <Steps order={order} />
          )}
        </>
      ) : null}
    </Sheet>
  );
}
