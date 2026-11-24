import { ActionButton } from '@/components/shared/action-button';
import { Sheet } from '@/components/shared/sheet';
import { StatusPill } from '@/components/shared/status-pill';
import { Text } from '@/components/ui/text';
import * as React from 'react';
import { View } from 'react-native';
import type { PharmacyOrder } from '../types';
import { formatNaira, formatWhen, orderStatusLabel, orderTone, statusLine } from '../utils';

type OrderDetailSheetProps = {
  order: PharmacyOrder | null;
  startCancelling: boolean;
  onClose: () => void;
  onCancel: (id: string) => void;
};

function Line({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View className="flex-row justify-between gap-3">
      <Text className={bold ? 'text-[13px] font-bold' : 'text-muted-foreground text-[13px]'}>
        {label}
      </Text>
      <Text className={bold ? 'text-[13px] font-bold' : 'text-[13px] font-medium'}>{value}</Text>
    </View>
  );
}

export function OrderDetailSheet({
  order,
  startCancelling,
  onClose,
  onCancel,
}: OrderDetailSheetProps) {
  const [confirming, setConfirming] = React.useState(startCancelling);

  React.useEffect(() => {
    setConfirming(startCancelling);
  }, [startCancelling, order?.id]);

  const itemsKobo = order
    ? order.items.reduce((sum, item) => sum + (item.unitPriceKobo ?? 0) * item.quantity, 0)
    : 0;

  return (
    <Sheet
      open={Boolean(order)}
      onClose={onClose}
      title="Order details"
      subtitle={order ? `${order.reference} · ${order.pharmacyName}` : undefined}>
      {order ? (
        <>
          <View className="gap-2">
            <StatusPill tone={orderTone(order.status)}>{orderStatusLabel(order)}</StatusPill>
            <Text className="text-[13px] leading-5">{statusLine(order)}</Text>
            <Text className="text-muted-foreground text-xs">
              {`Ordered ${formatWhen(order.createdAt)}`}
            </Text>
          </View>

          {order.status === 'ready' && order.collectionCode ? (
            <View className="bg-primary items-center gap-1 rounded-3xl px-4 py-4">
              <Text className="text-primary-foreground/75 text-[11px] font-semibold">
                Collection code
              </Text>
              <Text className="text-primary-foreground text-4xl font-extrabold tracking-[8px]">
                {order.collectionCode}
              </Text>
              <Text className="text-primary-foreground/75 text-center text-[11px]">
                Show this code when you pick it up.
              </Text>
            </View>
          ) : null}

          {order.declineReason ? (
            <View className="bg-muted rounded-2xl p-3.5">
              <Text className="text-muted-foreground text-xs leading-4.5">
                {`The pharmacy could not fill this: ${order.declineReason}`}
              </Text>
            </View>
          ) : null}

          <View className="bg-muted gap-2.5 rounded-3xl p-4">
            <Text className="text-sm font-bold">Medicines</Text>
            {order.items.map((item) => (
              <Line
                key={item.id}
                label={`${item.name}${item.strength ? ` ${item.strength}` : ''} × ${item.quantity}`}
                value={item.unitPriceKobo ? formatNaira(item.unitPriceKobo * item.quantity) : '—'}
              />
            ))}
            {order.totalKobo !== null ? (
              <>
                <View className="bg-border h-px" />
                <Line label="Medicines" value={formatNaira(itemsKobo)} />
                {order.deliveryFeeKobo ? (
                  <Line label="Delivery" value={formatNaira(order.deliveryFeeKobo)} />
                ) : null}
                <Line label="Service fee" value={formatNaira(order.serviceFeeKobo)} />
                <Line label="Total" value={formatNaira(order.totalKobo)} bold />
              </>
            ) : null}
          </View>

          <View className="bg-muted gap-1.5 rounded-3xl p-4">
            <Text className="text-sm font-bold">
              {order.fulfilment === 'delivery' ? 'Home delivery' : 'Pick up'}
            </Text>
            <Text className="text-muted-foreground text-xs leading-4.5">
              {[order.pharmacyName, order.pharmacyAddress, order.pharmacyPhone]
                .filter(Boolean)
                .join(' · ')}
            </Text>
            {order.deliveryStatus ? (
              <Text className="text-primary text-xs font-semibold">{order.deliveryStatus}</Text>
            ) : null}
          </View>

          {order.cancellable ? (
            confirming ? (
              <View className="gap-2.5">
                <Text className="text-[13px] font-semibold">Cancel this request?</Text>
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
                    onPress={() => {
                      onCancel(order.id);
                      onClose();
                    }}
                  />
                </View>
              </View>
            ) : (
              <ActionButton
                size="md"
                label="Cancel request"
                variant="outline"
                onPress={() => setConfirming(true)}
              />
            )
          ) : null}
        </>
      ) : null}
    </Sheet>
  );
}
