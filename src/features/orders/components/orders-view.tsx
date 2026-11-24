import { ActionButton } from '@/components/patterns/action-button';
import { ChipTabs } from '@/components/patterns/chip-tabs';
import { EmptyState } from '@/components/patterns/empty-state';
import { Text } from '@/components/ui/text';
import { AddFromClinic, type ClinicRecordKind } from '@/features/care-plan/components/add-from-clinic';
import { Pill } from 'lucide-react-native';
import * as React from 'react';
import { View } from 'react-native';
import { EMPTY, ORDERS_FOOTNOTE, VIEW_STATUSES, VIEWS } from '../constants';
import { cancelOrder, cancelRequest, useOrdersData } from '../hooks/use-orders';
import type { OrderView, PharmacyOrder, ShoppingRequest } from '../types';
import { ClosedRequestCard } from './closed-request-card';
import { LabBookingsSection } from './lab-bookings-section';
import { OpenRequestCard } from './open-request-card';
import { OrderCard } from './order-card';
import { OrderDetailSheet } from './order-detail-sheet';
import { RequestSheet } from './request-sheet';

const OPEN_ITEM = ['open', 'available', 'pending'];

type OrdersViewProps = {
  onMakeOrder?: () => void;
  onAddExternal?: (kind: ClinicRecordKind) => void;
  onBookLab?: () => void;
};

export function OrdersView({ onMakeOrder, onAddExternal, onBookLab }: OrdersViewProps) {
  const data = useOrdersData();
  const [view, setView] = React.useState<OrderView>('requests');
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [askCancel, setAskCancel] = React.useState(false);
  const [requestId, setRequestId] = React.useState<string | null>(null);

  const ordersIn = (value: OrderView) =>
    data.orders.filter((order) => VIEW_STATUSES[value].includes(order.status));
  const idsOf = (list: PharmacyOrder[]) =>
    new Set(list.map((order) => order.shoppingRequestId).filter(Boolean));

  const openOnly = data.requests.filter(
    (request) =>
      request.status === 'open' &&
      request.items.some((item) => OPEN_ITEM.includes(item.status)) &&
      !idsOf(ordersIn('requests')).has(request.id)
  );
  const closedOnly = data.requests.filter(
    (request) => request.status !== 'open' && !idsOf(ordersIn('closed')).has(request.id)
  );

  const extra = (value: OrderView) =>
    value === 'requests' ? openOnly.length : value === 'closed' ? closedOnly.length : 0;
  const orders = ordersIn(view);
  const selected = data.orders.find((order) => order.id === selectedId) ?? null;
  const request: ShoppingRequest | null = data.requests.find((item) => item.id === requestId) ?? null;
  const showEmpty =
    !orders.length && !((view === 'requests' && openOnly.length) || (view === 'closed' && closedOnly.length));

  return (
    <View className="gap-4">
      <View className="gap-3">
        <View className="gap-0.5">
          <Text className="text-lg font-extrabold">Your medicines. Your choice.</Text>
          <Text className="text-muted-foreground text-xs leading-[18px]">
            Make an order, compare pharmacy offers and choose when you&apos;re ready.
          </Text>
        </View>
        <View className="flex-row gap-2">
          <AddFromClinic className="flex-1" onPick={onAddExternal} />
          <ActionButton size="md" label="Make an order" onPress={onMakeOrder} />
        </View>
      </View>

      <ChipTabs
        value={view}
        onChange={setView}
        options={VIEWS.map(({ value, label }) => ({
          value,
          label,
          count: ordersIn(value).length + extra(value),
        }))}
      />

      <View className="gap-3">
        {view === 'requests'
          ? openOnly.map((item) => (
              <OpenRequestCard
                key={item.id}
                request={item}
                onOpen={() => setRequestId(item.id)}
                onCancel={() => cancelRequest(item.id)}
              />
            ))
          : null}
        {view === 'closed'
          ? closedOnly.map((item) => (
              <ClosedRequestCard key={item.id} request={item} onOpen={() => setRequestId(item.id)} />
            ))
          : null}
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onOpen={() => {
              setAskCancel(false);
              setSelectedId(order.id);
            }}
            onCancel={() => {
              setAskCancel(true);
              setSelectedId(order.id);
            }}
          />
        ))}
        {showEmpty ? (
          <View className="bg-card rounded-2xl">
            <EmptyState
              icon={Pill}
              title={EMPTY[view].title}
              text={EMPTY[view].description}
              action={
                view === 'requests' ? (
                  <ActionButton size="md" label="Make an order" onPress={onMakeOrder} />
                ) : undefined
              }
            />
          </View>
        ) : null}
      </View>

      <Text className="text-muted-foreground text-xs leading-[18px]">{ORDERS_FOOTNOTE}</Text>

      <LabBookingsSection bookings={data.labBookings} onViewAll={onBookLab} />

      <OrderDetailSheet
        order={selected}
        startCancelling={askCancel}
        onClose={() => {
          setSelectedId(null);
          setAskCancel(false);
        }}
        onCancel={cancelOrder}
      />
      <RequestSheet request={request} onClose={() => setRequestId(null)} />
    </View>
  );
}
