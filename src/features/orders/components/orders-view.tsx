import { ActionButton } from '@/components/shared/action-button';
import { AddButton } from '@/components/shared/add-button';
import { ChoiceSheet } from '@/components/shared/choice-sheet';
import { EmptyState } from '@/components/shared/empty-state';
import { InlineSelect } from '@/components/shared/inline-select';
import { Text } from '@/components/ui/text';
import {
  AddFromClinicSheet,
  type ClinicRecordKind,
} from '@/features/care-plan/components/add-from-clinic';
import { FileClock, FlaskConical, Pill } from 'lucide-react-native';
import { openMakeOrder } from '@/features/make-order/store';
import { ITEM_ENTER } from '@/lib/motion';
import { openExternalRecord } from '@/features/care-plan/external-store';
import * as React from 'react';
import { Alert } from 'react-native';
import Animated from 'react-native-reanimated';
import { View } from 'react-native';
import { EMPTY, ORDERS_FOOTNOTE, VIEW_STATUSES, VIEWS } from '../constants';
import { formatNaira } from '../utils';
import {
  PriceChangedError,
  askAllPharmacies,
  cancelOrder,
  cancelRequest,
  itemAction,
  orderFromPharmacies,
  payOrder,
  useRequestQuery,
  widenSearch,
} from '@/api/orders';
import { attempt } from '../actions';
import { useOrdersData } from '../hooks/use-orders';
import { useRequestOpener } from '../ui-store';
import type { OrderView, PharmacyOrder, ShoppingRequest } from '../types';
import { ClosedRequestCard } from './closed-request-card';
import { LabBookingsSection } from './lab-bookings-section';
import { OpenRequestCard } from './open-request-card';
import { OrderCard } from './order-card';
import { OrderDetailSheet } from './order-detail-sheet';
import { OffersSheet } from './offers-sheet';

const OPEN_ITEM = ['open', 'available', 'pending'];

type OrdersViewProps = {
  onAddExternal?: (kind: ClinicRecordKind) => void;
  onBookLab?: () => void;
};

export function OrdersView({ onAddExternal = openExternalRecord, onBookLab }: OrdersViewProps) {
  const data = useOrdersData();
  const [view, setView] = React.useState<OrderView>('requests');
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [askCancel, setAskCancel] = React.useState(false);
  const [requestId, setRequestId] = React.useState<string | null>(null);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [clinicOpen, setClinicOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  // Another screen can send the patient straight to one request's replies.
  const opener = useRequestOpener();
  React.useEffect(() => {
    if (!opener.nonce || !opener.requestId) return;
    setView('requests');
    setRequestId(opener.requestId);
  }, [opener.nonce, opener.requestId]);

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
  const total = (value: OrderView) => ordersIn(value).length + extra(value);
  const activeTotal = total('requests') + total('active');
  const pastTotal = total('closed') + total('history');
  const selected = data.orders.find((order) => order.id === selectedId) ?? null;
  const listed = data.requests.find((item) => item.id === requestId) ?? null;
  const detail = useRequestQuery(requestId, listed);
  const request: ShoppingRequest | null = requestId ? (detail.data ?? listed) : null;

  // Runs one server action with the sheet locked, and says plainly if it failed.
  async function work<T>(title: string, run: () => Promise<T>) {
    setBusy(true);
    try {
      return await attempt(title, run);
    } finally {
      setBusy(false);
    }
  }
  const showEmpty =
    !orders.length &&
    !((view === 'requests' && openOnly.length) || (view === 'closed' && closedOnly.length));

  return (
    <View className="gap-4">
      <View className="flex-row items-start justify-between gap-4">
        <View className="min-w-0 flex-1 gap-0.5">
          <Text className="text-lg font-extrabold">Your medicines. Your choice.</Text>
          <Text className="text-muted-foreground text-xs leading-4.5">
            Make an order, compare pharmacy offers and choose when you&apos;re ready.
          </Text>
        </View>
        <AddButton label="Add or make an order" onPress={() => setMenuOpen(true)} />
      </View>

      <View className="flex-row items-center justify-between gap-3">
        <Text className="text-muted-foreground text-xs">
          <Text className="text-foreground text-xs font-bold">{activeTotal}</Text>
          {' active · '}
          <Text className="text-foreground text-xs font-bold">{pastTotal}</Text>
          {' past'}
        </Text>
        <InlineSelect<OrderView>
          title="Show"
          value={view}
          options={VIEWS.map(({ value, label }) => ({ value, label }))}
          onChange={setView}
        />
      </View>

      <Animated.View key={view} entering={ITEM_ENTER} className="gap-3">
        {view === 'requests'
          ? openOnly.map((item) => (
              <OpenRequestCard
                key={item.id}
                request={item}
                onOpen={() => setRequestId(item.id)}
                onCancel={() => work("Couldn't cancel the request", () => cancelRequest(item.id))}
              />
            ))
          : null}
        {view === 'closed'
          ? closedOnly.map((item) => (
              <ClosedRequestCard
                key={item.id}
                request={item}
                onOpen={() => setRequestId(item.id)}
              />
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
                  <ActionButton size="md" label="Make an order" onPress={() => openMakeOrder()} />
                ) : undefined
              }
            />
          </View>
        ) : null}
      </Animated.View>

      <Text className="text-muted-foreground text-xs leading-4.5">{ORDERS_FOOTNOTE}</Text>

      <LabBookingsSection bookings={data.labBookings} onViewAll={onBookLab} />

      <ChoiceSheet<'medication' | 'lab' | 'clinic'>
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        title="Your medicines and tests"
        subtitle="What would you like to do?"
        choices={[
          {
            key: 'medication',
            title: 'Order medicines',
            description: 'Compare pharmacy prices',
            icon: Pill,
          },
          {
            key: 'lab',
            title: 'Book a lab test',
            description: 'Find laboratories near you',
            icon: FlaskConical,
          },
          {
            key: 'clinic',
            title: 'Add from another clinic',
            description: 'Keep a record from outside NairaClinic',
            icon: FileClock,
          },
        ]}
        onPick={(key) => {
          if (key === 'clinic') setTimeout(() => setClinicOpen(true), 300);
          else setTimeout(() => openMakeOrder({ kind: key }), 300);
        }}
      />
      <AddFromClinicSheet
        open={clinicOpen}
        onClose={() => setClinicOpen(false)}
        onPick={onAddExternal}
      />
      <OrderDetailSheet
        order={selected}
        startCancelling={askCancel}
        onClose={() => {
          setSelectedId(null);
          setAskCancel(false);
        }}
        busy={busy}
        onCancel={(id) => work("Couldn't cancel the order", () => cancelOrder(id))}
        onPay={async (id) => {
          const outcome = await work("Couldn't start the payment", () => payOrder(id));
          if (!outcome) return;
          if (outcome.paid) setSelectedId(null);
          else Alert.alert('Payment not confirmed', outcome.message);
        }}
      />
      <OffersSheet
        request={request}
        onClose={() => setRequestId(null)}
        busy={busy}
        onRefresh={() => detail.refetch()}
        onAskAll={() => {
          if (requestId) work("Couldn't ask the pharmacies", () => askAllPharmacies(requestId));
        }}
        onWiden={() => {
          if (requestId) work("Couldn't search a wider area", () => widenSearch(requestId));
        }}
        onItem={(itemId, action) => {
          if (requestId)
            work(action === 'cancel' ? "Couldn't remove the medicine" : "Couldn't ask again", () =>
              itemAction(requestId, itemId, action)
            );
        }}
        onOrder={async (choice) => {
          if (!requestId) return;
          setBusy(true);
          try {
            const outcome = await orderFromPharmacies({ requestId, ...choice });
            if (outcome.paid) {
              setRequestId(null);
              Alert.alert('Paid', 'Your order is with the pharmacy.');
            } else Alert.alert('Payment not confirmed', outcome.message);
          } catch (error) {
            if (error instanceof PriceChangedError) {
              Alert.alert(
                'The price changed',
                `The new total is ${formatNaira(error.totalKobo)}. Check it and order again.`
              );
              detail.refetch();
            } else {
              Alert.alert(
                "Couldn't place the order",
                error instanceof Error ? error.message : 'Please try again.'
              );
            }
          } finally {
            setBusy(false);
          }
        }}
        onOpenOrder={(orderId) => {
          setRequestId(null);
          setTimeout(() => setSelectedId(orderId), 300);
        }}
      />
    </View>
  );
}
