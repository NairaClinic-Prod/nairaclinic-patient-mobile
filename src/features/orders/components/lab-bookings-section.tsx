import { ActionButton } from '@/components/shared/action-button';
import { Sheet } from '@/components/shared/sheet';
import { SectionHeader } from '@/components/shared/section-header';
import { StatusPill } from '@/components/shared/status-pill';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Building2, ChevronRight, ExternalLink, FlaskConical, House } from 'lucide-react-native';
import * as React from 'react';
import { Linking, Pressable, View } from 'react-native';
import { BOOKING_STATUS, LABS_SHOWN } from '../constants';
import type { LabBooking } from '../types';
import { formatDay, formatNaira, formatWhen } from '../utils';

const EMPTY_TEXT =
  'Tests you book from a consultation appear here, with results once the laboratory releases them.';

type LabBookingsSectionProps = {
  bookings: LabBooking[];
  title?: string;
  action?: string;
  limit?: number;
  onViewAll?: () => void;
};

export function LabBookingsSection({
  bookings,
  title = 'Lab tests',
  action = 'Book or view all',
  limit = LABS_SHOWN,
  onViewAll,
}: LabBookingsSectionProps) {
  const [open, setOpen] = React.useState<LabBooking | null>(null);
  const list = bookings.filter((booking) => booking.status !== 'pending_payment').slice(0, limit);

  return (
    <View className="gap-3">
      <SectionHeaderInline title={title} action={action} onViewAll={onViewAll} />
      {list.length ? (
        <View className="overflow-hidden rounded-2xl bg-card">
          {list.map((booking, index) => (
            <Pressable
              key={booking.id}
              role="button"
              onPress={() => setOpen(booking)}
              className={`flex-row items-center gap-3 border-border px-3.5 py-3 active:opacity-70 ${
                index < list.length - 1 ? 'border-b' : ''
              }`}>
              <View className="size-10 items-center justify-center rounded-full bg-secondary">
                <Icon as={FlaskConical} className="size-4.5 text-primary" />
              </View>
              <View className="min-w-0 flex-1 gap-1">
                <Text className="text-[13px] leading-4.5 font-bold">
                  {booking.items.map((item) => item.name).join(', ')}
                </Text>
                <Text className="text-[11px] leading-4 text-muted-foreground">
                  {`${booking.labName} · ${formatWhen(booking.slotStart)} · ${booking.reference}`}
                </Text>
                <StatusPill tone={BOOKING_STATUS[booking.status].tone}>
                  {BOOKING_STATUS[booking.status].label}
                </StatusPill>
              </View>
              <Icon as={ChevronRight} className="size-4 text-muted-foreground" />
            </Pressable>
          ))}
        </View>
      ) : (
        <View className="rounded-2xl border border-dashed border-border px-4 py-6">
          <Text className="text-center text-xs leading-4.5 text-muted-foreground">
            {EMPTY_TEXT}
          </Text>
        </View>
      )}
      <LabBookingSheet booking={open} onClose={() => setOpen(null)} />
    </View>
  );
}

function SectionHeaderInline({
  title,
  action,
  onViewAll,
}: {
  title: string;
  action?: string;
  onViewAll?: () => void;
}) {
  return (
    <View className="-mx-6">
      <SectionHeader title={title} action={action} onActionPress={onViewAll} />
    </View>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between gap-3">
      <Text className="flex-1 text-[13px] text-muted-foreground">{label}</Text>
      <Text className="text-[13px] font-medium">{value}</Text>
    </View>
  );
}

function LabBookingSheet({
  booking,
  onClose,
}: {
  booking: LabBooking | null;
  onClose: () => void;
}) {
  return (
    <Sheet
      open={Boolean(booking)}
      onClose={onClose}
      title={booking?.labName ?? 'Lab booking'}
      subtitle={booking ? `Lab booking ${booking.reference} · ${booking.branchName}` : undefined}>
      {booking ? (
        <>
          <View className="gap-2">
            <StatusPill tone={BOOKING_STATUS[booking.status].tone}>
              {BOOKING_STATUS[booking.status].label}
            </StatusPill>
            <View className="flex-row items-center gap-1.5">
              <Icon
                as={booking.collection === 'home' ? House : Building2}
                className="size-4 text-muted-foreground"
              />
              <Text className="flex-1 text-xs leading-4.5 text-muted-foreground">
                {`${formatWhen(booking.slotStart)} · ${
                  booking.collection === 'home' ? 'Sample collected at home' : booking.address
                }`}
              </Text>
            </View>
          </View>
          <View className="gap-2.5 rounded-3xl bg-muted p-4">
            <Text className="text-sm font-bold">Tests</Text>
            {booking.items.map((item) => (
              <Line
                key={item.id}
                label={`${item.name}${item.released ? ' · result ready' : ''}`}
                value={formatNaira(item.priceKobo)}
              />
            ))}
            {booking.homeFeeKobo ? (
              <Line label="Home collection" value={formatNaira(booking.homeFeeKobo)} />
            ) : null}
            <View className="h-px bg-border" />
            <View className="flex-row justify-between">
              <Text className="text-[13px] font-bold">Total</Text>
              <Text className="text-[13px] font-bold">{formatNaira(booking.totalKobo)}</Text>
            </View>
          </View>
          {booking.results.length ? (
            <View className="gap-2.5">
              <Text className="text-sm font-bold">Results</Text>
              {booking.results.map((result) => (
                <View
                  key={result.id}
                  className="flex-row items-center gap-3 rounded-2xl bg-muted p-3">
                  <View className="min-w-0 flex-1">
                    <Text className="text-[13px] font-semibold" numberOfLines={1}>
                      {result.testNames.join(', ')}
                    </Text>
                    <Text className="text-[11px] text-muted-foreground">
                      {result.releasedAt
                        ? `Released ${formatDay(result.releasedAt)}`
                        : result.fileName}
                    </Text>
                  </View>
                  {result.url ? (
                    <ActionButton
                      label="Open"
                      icon={ExternalLink}
                      onPress={() => Linking.openURL(result.url as string)}
                    />
                  ) : null}
                </View>
              ))}
            </View>
          ) : null}
        </>
      ) : null}
    </Sheet>
  );
}
