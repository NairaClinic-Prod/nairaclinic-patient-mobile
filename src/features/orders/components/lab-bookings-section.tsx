import { ActionButton } from '@/components/patterns/action-button';
import { Sheet } from '@/components/patterns/sheet';
import { SectionHeader } from '@/components/patterns/section-header';
import { StatusPill } from '@/components/patterns/status-pill';
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

type LabBookingsSectionProps = { bookings: LabBooking[]; onViewAll?: () => void };

export function LabBookingsSection({ bookings, onViewAll }: LabBookingsSectionProps) {
  const [open, setOpen] = React.useState<LabBooking | null>(null);
  const list = bookings.filter((booking) => booking.status !== 'pending_payment').slice(0, LABS_SHOWN);

  return (
    <View className="gap-3">
      <SectionHeaderInline onViewAll={onViewAll} />
      {list.length ? (
        <View className="bg-card overflow-hidden rounded-2xl">
          {list.map((booking, index) => (
            <Pressable
              key={booking.id}
              role="button"
              onPress={() => setOpen(booking)}
              className={`border-border flex-row items-center gap-3 px-3.5 py-3 active:opacity-70 ${
                index < list.length - 1 ? 'border-b' : ''
              }`}>
              <View className="bg-secondary size-10 items-center justify-center rounded-full">
                <Icon as={FlaskConical} className="text-primary size-[18px]" />
              </View>
              <View className="min-w-0 flex-1 gap-1">
                <Text className="text-[13px] font-bold leading-[18px]">
                  {booking.items.map((item) => item.name).join(', ')}
                </Text>
                <Text className="text-muted-foreground text-[11px] leading-4">
                  {`${booking.labName} · ${formatWhen(booking.slotStart)} · ${booking.reference}`}
                </Text>
                <StatusPill tone={BOOKING_STATUS[booking.status].tone}>
                  {BOOKING_STATUS[booking.status].label}
                </StatusPill>
              </View>
              <Icon as={ChevronRight} className="text-muted-foreground size-4" />
            </Pressable>
          ))}
        </View>
      ) : (
        <View className="border-border rounded-2xl border border-dashed px-4 py-6">
          <Text className="text-muted-foreground text-center text-xs leading-[18px]">
            {EMPTY_TEXT}
          </Text>
        </View>
      )}
      <LabBookingSheet booking={open} onClose={() => setOpen(null)} />
    </View>
  );
}

function SectionHeaderInline({ onViewAll }: { onViewAll?: () => void }) {
  return (
    <View className="-mx-6">
      <SectionHeader title="Lab tests" action="Book or view all" onActionPress={onViewAll} />
    </View>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between gap-3">
      <Text className="text-muted-foreground flex-1 text-[13px]">{label}</Text>
      <Text className="text-[13px] font-medium">{value}</Text>
    </View>
  );
}

function LabBookingSheet({ booking, onClose }: { booking: LabBooking | null; onClose: () => void }) {
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
                className="text-muted-foreground size-4"
              />
              <Text className="text-muted-foreground flex-1 text-xs leading-[18px]">
                {`${formatWhen(booking.slotStart)} · ${
                  booking.collection === 'home' ? 'Sample collected at home' : booking.address
                }`}
              </Text>
            </View>
          </View>
          <View className="bg-muted gap-2.5 rounded-3xl p-4">
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
            <View className="bg-border h-px" />
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
                  className="bg-muted flex-row items-center gap-3 rounded-2xl p-3">
                  <View className="min-w-0 flex-1">
                    <Text className="text-[13px] font-semibold" numberOfLines={1}>
                      {result.testNames.join(', ')}
                    </Text>
                    <Text className="text-muted-foreground text-[11px]">
                      {result.releasedAt ? `Released ${formatDay(result.releasedAt)}` : result.fileName}
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
