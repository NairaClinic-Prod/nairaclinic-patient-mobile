import { orderKeys, quoteRequest } from '@/api/orders';
import { useQuery } from '@tanstack/react-query';
import { ActionButton } from '@/components/shared/action-button';
import { PressableScale } from '@/components/shared/pressable-scale';
import { Sheet } from '@/components/shared/sheet';
import { StatusPill, type PillTone } from '@/components/shared/status-pill';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as Haptics from 'expo-haptics';
import { ChevronDown, Clock, Package, Radar, RefreshCw, Send, Store } from 'lucide-react-native';
import * as React from 'react';
import { View } from 'react-native';
import type { OrderStatus, PharmacyOffer, RequestOrder, ShoppingRequest } from '../types';
import {
  OPEN_ITEM_STATUSES,
  formatDay,
  formatNaira,
  formatWhen,
  hasLine,
  plural,
  quoteFor,
} from '../utils';
import { OfferCard } from './offer-card';

const RECENT = 3;

const ORDER_LINE: Partial<Record<OrderStatus, (order: RequestOrder) => string>> = {
  new: (order) => `Sent to ${order.pharmacyName}. Waiting for its price.`,
  quoted: (order) => `${order.pharmacyName} sent its price. Pay to confirm.`,
  accepted: (order) =>
    order.paid
      ? `Paid · waiting for ${order.pharmacyName} to accept`
      : `Waiting for ${order.pharmacyName} to accept`,
  preparing: (order) => `${order.pharmacyName} is preparing your order`,
  ready: () => 'Ready',
};

const ORDER_PILL: Partial<Record<OrderStatus, { label: string; tone: PillTone }>> = {
  new: { label: 'Waiting for price', tone: 'info' },
  quoted: { label: 'Price ready', tone: 'pending' },
  accepted: { label: 'Waiting to accept', tone: 'pending' },
  preparing: { label: 'Preparing', tone: 'info' },
  ready: { label: 'Ready', tone: 'active' },
};

const DOT: Record<string, string> = {
  info: 'bg-primary/60',
  good: 'bg-success',
  warn: 'bg-warning',
  bad: 'bg-destructive',
};

const isOpen = (status: string) => OPEN_ITEM_STATUSES.includes(status);

function copyFor(request: ShoppingRequest) {
  const open = request.items.filter((item) => isOpen(item.status));
  const ordered = request.orders.length > 0 && open.length === 0;
  const where =
    request.fulfilment === 'pickup'
      ? 'Pickup from the pharmacy'
      : `Delivery to ${request.area ?? 'your address'}`;
  const base = `${request.reference} · ${plural(open.length || request.items.length, 'medicine')} · ${where}.`;

  if (request.status === 'expired') {
    return {
      eyebrow: 'Request closed',
      title: 'No pharmacy replied in time.',
      text: `${base} Make a new order any time.`,
    };
  }
  if (request.status === 'cancelled') {
    return { eyebrow: 'Cancelled', title: 'You cancelled this request.', text: base };
  }
  return {
    eyebrow: ordered
      ? 'Ordered'
      : request.orders.length
        ? 'Some medicines ordered · choose for the rest'
        : 'No payment until you choose',
    title: request.orders.length ? 'Your medicine request.' : 'Compare your pharmacy offers.',
    text: ordered
      ? `${base} See where your order is below.`
      : `${base} The lowest-price badge compares complete offers only.`,
  };
}

function Section({
  title,
  text,
  children,
}: {
  title: string;
  text?: string;
  children: React.ReactNode;
}) {
  return (
    <View className="gap-3">
      <View className="gap-0.5">
        <Text className="text-base font-extrabold">{title}</Text>
        {text ? <Text className="text-muted-foreground text-xs leading-4.5">{text}</Text> : null}
      </View>
      {children}
    </View>
  );
}

function YourOrders({
  orders,
  onOpenOrder,
}: {
  orders: RequestOrder[];
  onOpenOrder?: (orderId: string) => void;
}) {
  return (
    <Section title={orders.length === 1 ? 'Your order' : 'Your orders'}>
      {orders.map((order) => {
        const pill = ORDER_PILL[order.status];
        return (
          <View key={order.id} className="border-border gap-3 rounded-2xl border p-4">
            <View className="flex-row items-center gap-3">
              <View className="bg-secondary size-11 items-center justify-center rounded-xl">
                <Icon as={Store} className="text-primary size-5" />
              </View>
              <View className="min-w-0 flex-1 gap-1">
                <View className="flex-row flex-wrap items-center gap-2">
                  <Text className="text-[15px] font-bold">{order.pharmacyName}</Text>
                  {pill ? <StatusPill tone={pill.tone}>{pill.label}</StatusPill> : null}
                </View>
                <Text className="text-muted-foreground text-[13px] leading-4.5">
                  {(ORDER_LINE[order.status] ?? (() => order.status))(order)}
                </Text>
                <Text className="text-muted-foreground text-xs">
                  {[order.reference, order.totalKobo ? formatNaira(order.totalKobo) : null]
                    .filter(Boolean)
                    .join(' · ')}
                </Text>
              </View>
            </View>
            {onOpenOrder ? (
              <ActionButton
                size="md"
                variant="outline"
                label="Order details"
                onPress={() => onOpenOrder(order.id)}
              />
            ) : null}
          </View>
        );
      })}
    </Section>
  );
}

function Timeline({ request }: { request: ShoppingRequest }) {
  const [all, setAll] = React.useState(false);
  const entries = request.timeline;
  const shown = all ? entries : entries.slice(-RECENT);
  const open = request.status === 'open';
  const pending =
    open && request.waiting
      ? `Waiting for ${plural(request.waiting, 'pharmacy', 'pharmacies')} to reply.`
      : null;

  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between gap-3">
        <Text className="text-base font-extrabold">What&apos;s happening</Text>
        {entries.length > RECENT ? (
          <PressableScale
            scaleTo={0.96}
            role="button"
            onPress={() => setAll((current) => !current)}>
            <Text className="text-primary text-[13px] font-semibold">
              {all ? 'Show less' : `Show all activity (${entries.length})`}
            </Text>
          </PressableScale>
        ) : null}
      </View>
      <View className="border-border gap-4 rounded-2xl border p-4">
        {shown.map((entry, index) => (
          <View key={`${entry.at}-${index}`} className="flex-row gap-3">
            <View className={cn('mt-1.5 size-2.5 rounded-full', DOT[entry.tone])} />
            <View className="min-w-0 flex-1">
              <Text className="text-[13px] leading-5">{entry.text}</Text>
              <Text className="text-muted-foreground text-xs">{formatWhen(entry.at)}</Text>
            </View>
          </View>
        ))}
        {pending ? (
          <View className="flex-row gap-3">
            <View className="bg-primary mt-1.5 size-2.5 rounded-full" />
            <Text className="text-primary flex-1 text-[13px] font-semibold">{pending}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function Medicines({
  request,
  closed,
  onItem,
}: {
  request: ShoppingRequest;
  closed: boolean;
  onItem?: (itemId: string, action: 'cancel' | 'ask_again') => void;
}) {
  const [expanded, setExpanded] = React.useState(false);
  const covered = (item: ShoppingRequest['items'][number]) =>
    request.offers.some((offer) => hasLine(offer, item));

  return (
    <View className="border-border rounded-2xl border">
      <PressableScale
        scaleTo={0.99}
        role="button"
        accessibilityState={{ expanded }}
        onPress={() => setExpanded((current) => !current)}
        className="flex-row items-center justify-between px-4 py-3.5">
        <Text className="text-[13px] font-bold">{`Your medicines (${request.items.length})`}</Text>
        <Icon
          as={ChevronDown}
          className={cn('text-muted-foreground size-4', expanded && 'rotate-180')}
        />
      </PressableScale>
      {expanded ? (
        <View className="border-border border-t px-4">
          {request.items.map((item, index) => {
            const state =
              item.status === 'ordered'
                ? { label: 'Ordered', tone: 'info' as const }
                : item.status === 'cancelled'
                  ? { label: 'Removed', tone: 'inactive' as const }
                  : covered(item)
                    ? { label: 'Available', tone: 'active' as const }
                    : { label: closed ? 'Not found' : 'Not found yet', tone: 'pending' as const };
            return (
              <View
                key={item.id}
                className={cn(
                  'flex-row items-center justify-between gap-3 py-3',
                  index > 0 && 'border-border border-t'
                )}>
                <View className="min-w-0 flex-1">
                  <Text
                    className={cn(
                      'text-[13px] font-semibold',
                      item.status === 'cancelled' && 'text-muted-foreground line-through'
                    )}>
                    {item.name}
                  </Text>
                  <Text className="text-muted-foreground text-xs">
                    {`Quantity ${item.quantity}${item.brand ? ` · ${item.brand} only` : ''}`}
                  </Text>
                </View>
                <View className="items-end gap-1.5">
                  <StatusPill tone={state.tone}>{state.label}</StatusPill>
                  {onItem &&
                  request.detailed &&
                  !closed &&
                  isOpen(item.status) &&
                  !covered(item) ? (
                    <View className="flex-row gap-3">
                      <PressableScale
                        scaleTo={0.96}
                        role="button"
                        onPress={() => onItem(item.id, 'ask_again')}>
                        <Text className="text-primary text-xs font-semibold">Ask again</Text>
                      </PressableScale>
                      <PressableScale
                        scaleTo={0.96}
                        role="button"
                        onPress={() => onItem(item.id, 'cancel')}>
                        <Text className="text-muted-foreground text-xs font-semibold">Remove</Text>
                      </PressableScale>
                    </View>
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

type BodyProps = {
  request: ShoppingRequest;
  picked: string[];
  setPicked: React.Dispatch<React.SetStateAction<string[]>>;
  onOpenOrder?: (orderId: string) => void;
  onAskAll?: () => void;
  onWiden?: () => void;
  onItem?: (itemId: string, action: 'cancel' | 'ask_again') => void;
  onOrder?: (order: OrderChoice) => void;
  busy?: boolean;
};

export type OrderChoice = {
  pharmacyIds: string[];
  expectedTotalKobo: number;
  allowPartial: boolean;
};

function Body({
  request,
  picked,
  setPicked,
  onOpenOrder,
  onAskAll,
  onWiden,
  onItem,
  onOrder,
  busy,
}: BodyProps) {
  const closed = request.status !== 'open';
  const open = request.items.filter((item) => isOpen(item.status));
  const ordered = request.orders.length > 0 && open.length === 0;
  const showOffers = !closed && !ordered;
  const pickup = request.fulfilment === 'pickup';

  const sorted = [...request.offers].sort(
    (a, b) => b.covers - a.covers || a.estimatedTotalKobo - b.estimatedTotalKobo
  );
  const accepted = sorted.filter((offer) => offer.replied && offer.covers > 0);
  const shown: PharmacyOffer[] = accepted.length
    ? accepted
    : [...sorted].sort((a, b) => (a.distanceMeters ?? Infinity) - (b.distanceMeters ?? Infinity));
  const complete = shown.filter(
    (offer) => offer.covers >= open.length && open.length > 0 && offer.estimatedTotalKobo > 0
  );
  const lowest = complete.length
    ? complete.reduce((a, b) => (b.estimatedTotalKobo < a.estimatedTotalKobo ? b : a)).pharmacyId
    : null;
  const everythingCovered = sorted.some((offer) => offer.covers >= open.length && open.length > 0);
  const local = picked.length ? quoteFor(request, picked) : null;
  // The server prices the chosen pharmacies; that total is the one that gets charged.
  const version = `${request.offers.map((offer) => `${offer.pharmacyId}:${offer.estimatedTotalKobo}`).join('|')}|${open.length}`;
  const priced = useQuery({
    queryKey: orderKeys.quote(request.id, [...picked].sort().join(','), version),
    queryFn: () => quoteRequest(request.id, picked),
    enabled: picked.length > 0 && request.detailed && showOffers,
    retry: false,
  });
  const quote = local
    ? {
        ...local,
        totalKobo: priced.data?.totalKobo ?? local.totalKobo,
        covered: priced.data
          ? Math.max(0, local.open - priced.data.uncoveredItemIds.length)
          : local.covered,
      }
    : null;

  const toggle = (pharmacyId: string) => {
    Haptics.selectionAsync();
    setPicked((current) =>
      current.includes(pharmacyId)
        ? current.filter((id) => id !== pharmacyId)
        : current.length >= request.maxPharmacies
          ? current
          : [...current, pharmacyId]
    );
  };

  return (
    <>
      <View className="border-primary/15 bg-secondary/40 flex-row items-center gap-3.5 rounded-2xl border p-3.5">
        <View className="bg-secondary size-11 items-center justify-center rounded-xl">
          <Icon as={pickup ? Store : Package} className="text-primary size-5" />
        </View>
        <View className="min-w-0 flex-1 gap-0.5">
          <Text className="text-muted-foreground text-xs">
            {pickup ? 'You collect from' : 'Deliver to'}
          </Text>
          <Text className="text-[15px] leading-5 font-bold" numberOfLines={2}>
            {pickup
              ? 'The pharmacy you choose'
              : (request.deliveryAddress ?? request.area ?? 'Your address')}
          </Text>
          <Text className="text-muted-foreground text-xs">
            {[request.area, formatDay(request.createdAt)].filter(Boolean).join(' · ')}
          </Text>
        </View>
      </View>

      {request.orders.length ? (
        <YourOrders orders={request.orders} onOpenOrder={onOpenOrder} />
      ) : null}

      {request.search?.widerSuggested && showOffers && onWiden ? (
        <View className="border-border gap-3 rounded-2xl border p-4">
          <View className="flex-row items-start gap-3">
            <Icon as={Radar} className="text-primary mt-0.5 size-5" />
            <View className="flex-1 gap-0.5">
              <Text className="text-[14px] font-semibold">Want more choice?</Text>
              <Text className="text-muted-foreground text-[13px] leading-5">
                {`We can also ask ${request.search.widerText}.`}
              </Text>
            </View>
          </View>
          <ActionButton
            size="md"
            variant="outline"
            label="Search a wider area"
            disabled={busy}
            onPress={onWiden}
          />
        </View>
      ) : null}

      {showOffers ? (
        <Section
          title={
            request.orders.length
              ? `For the rest: ${open.map((item) => item.name).join(', ')}`
              : accepted.length
                ? 'Pharmacies that accepted'
                : 'Pharmacies near you'
          }
          text={
            accepted.length
              ? `Compare their prices and choose up to ${request.maxPharmacies}. We split your medicines to the cheapest one that has each.`
              : shown.length
                ? 'No pharmacy has accepted yet. Choose one that has your medicines to order now, or ask them all.'
                : undefined
          }>
          {!everythingCovered && shown.length ? (
            <ActionButton
              size="md"
              variant="outline"
              icon={Send}
              label="Ask all pharmacies"
              disabled={busy}
              onPress={onAskAll}
            />
          ) : null}
          {shown.length ? (
            shown.map((offer) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                items={open}
                lowest={offer.pharmacyId === lowest}
                picked={picked.includes(offer.pharmacyId)}
                disabled={offer.covers === 0}
                onToggle={() => toggle(offer.pharmacyId)}
              />
            ))
          ) : (
            <View className="border-border items-center gap-2 rounded-2xl border border-dashed px-6 py-10">
              <Icon as={Package} className="text-muted-foreground size-8" />
              <Text className="text-center text-base font-bold">
                Your request is with eligible pharmacies.
              </Text>
              <Text className="text-muted-foreground text-center text-[13px] leading-5">
                Offers will appear here when pharmacies respond. No payment has been made.
              </Text>
            </View>
          )}
        </Section>
      ) : null}

      {request.timeline.length ? <Timeline request={request} /> : null}

      <Medicines request={request} closed={closed} onItem={onItem} />

      {quote && showOffers ? (
        <View className="border-primary/20 bg-card gap-3 rounded-2xl border p-4">
          <View className="flex-row items-baseline justify-between gap-3">
            <Text className="text-muted-foreground flex-1 text-[13px]">
              {`${quote.covered} of ${quote.open} medicines from ${plural(quote.pharmacies, 'pharmacy', 'pharmacies')}`}
            </Text>
            <Text className="text-xl font-extrabold">{formatNaira(quote.totalKobo)}</Text>
          </View>
          {quote.covered < quote.open ? (
            <View className="bg-warning-soft flex-row items-start gap-2 rounded-xl px-3 py-2">
              <Icon as={Clock} className="text-warning mt-0.5 size-4" />
              <Text className="text-warning flex-1 text-[13px] leading-5">
                {`${plural(quote.open - quote.covered, 'medicine')} stay${quote.open - quote.covered === 1 ? 's' : ''} open. You can ask again or remove it later.`}
              </Text>
            </View>
          ) : null}
          <ActionButton
            size="md"
            label={
              priced.isFetching
                ? 'Checking the price…'
                : `Order & pay ${formatNaira(quote.totalKobo)}`
            }
            disabled={busy || priced.isFetching || priced.isError}
            onPress={() =>
              onOrder?.({
                pharmacyIds: picked,
                expectedTotalKobo: quote.totalKobo,
                allowPartial: quote.covered < quote.open,
              })
            }
          />
        </View>
      ) : null}
    </>
  );
}

type OffersSheetProps = {
  request: ShoppingRequest | null;
  onClose: () => void;
  onOpenOrder?: (orderId: string) => void;
  onAskAll?: () => void;
  onWiden?: () => void;
  onItem?: (itemId: string, action: 'cancel' | 'ask_again') => void;
  onOrder?: (order: OrderChoice) => void;
  onRefresh?: () => Promise<unknown>;
  busy?: boolean;
};

export function OffersSheet({
  request,
  onClose,
  onOpenOrder,
  onAskAll,
  onWiden,
  onItem,
  onOrder,
  onRefresh,
  busy,
}: OffersSheetProps) {
  const [picked, setPicked] = React.useState<string[]>([]);
  const [refreshing, setRefreshing] = React.useState(false);

  React.useEffect(() => {
    setPicked([]);
  }, [request?.id]);

  const copy = request ? copyFor(request) : null;
  const closed = request ? request.status !== 'open' : false;

  async function refresh() {
    setRefreshing(true);
    try {
      await onRefresh?.();
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <Sheet
      open={Boolean(request)}
      onClose={onClose}
      showClose
      divided
      snapPoints={['92%']}
      eyebrow={copy?.eyebrow}
      title={copy?.title ?? ''}
      subtitle={copy?.text}
      footer={
        request ? (
          <View className="gap-3">
            <Text className="text-muted-foreground text-xs leading-4.5">
              {request.status === 'expired'
                ? 'No pharmacy replied in time, so this request closed. Make a new order any time.'
                : closed
                  ? 'This request is closed.'
                  : request.expiresAt
                    ? `Request responses are open until ${formatWhen(request.expiresAt)}.`
                    : 'New replies show up here automatically. You’ll also get a notification.'}
            </Text>
            <View className="flex-row gap-2">
              <ActionButton
                size="md"
                variant="outline"
                label="Close"
                className="flex-1"
                onPress={onClose}
              />
              <ActionButton
                size="md"
                variant="outline"
                icon={RefreshCw}
                label={refreshing ? 'Refreshing…' : 'Refresh offers'}
                className="flex-1"
                disabled={refreshing}
                onPress={refresh}
              />
            </View>
          </View>
        ) : undefined
      }>
      {request ? (
        <Body
          request={request}
          picked={picked}
          setPicked={setPicked}
          onOpenOrder={onOpenOrder}
          onAskAll={onAskAll}
          onWiden={onWiden}
          onItem={onItem}
          onOrder={onOrder}
          busy={busy}
        />
      ) : null}
    </Sheet>
  );
}
