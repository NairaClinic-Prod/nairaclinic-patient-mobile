import { CheckBox } from '@/components/shared/check-box';
import { PressableScale } from '@/components/shared/pressable-scale';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { formatNaira } from '@/features/orders/utils';
import { cn } from '@/lib/utils';
import { ChevronDown, MapPin } from 'lucide-react-native';
import * as React from 'react';
import { View } from 'react-native';
import { Choosable } from '@/components/shared/choosable';
import type {
  Collection,
  LabResult,
  PharmacyCombination,
  PharmacyLine,
  PharmacyResult,
} from '../types';

export type Selection = 'combo' | string | null;

const kilometres = (meters: number) =>
  meters < 1000 ? `${Math.round(meters / 10) * 10} m` : `${(meters / 1000).toFixed(1)} km`;

const minutes = (value: number) =>
  value < 60
    ? `${value} min`
    : `${Math.floor(value / 60)} hr${value % 60 ? ` ${value % 60} min` : ''}`;

function Title({ name, branch }: { name: string; branch: string | null }) {
  return (
    <Text className="text-[15px] leading-5 font-bold" numberOfLines={1}>
      {name}
      {branch ? (
        <Text className="text-muted-foreground text-[15px] font-normal">{`  ${branch}`}</Text>
      ) : null}
    </Text>
  );
}

function Total({ label = 'Total you pay', value }: { label?: string; value: number }) {
  return (
    <View className="mt-3 flex-row items-baseline justify-between">
      <Text className="text-muted-foreground text-xs">{label}</Text>
      <Text className="text-xl font-extrabold">{formatNaira(value)}</Text>
    </View>
  );
}

function Money({ label, value }: { label: string; value: number }) {
  return (
    <View className="flex-row items-baseline justify-between">
      <Text className="text-muted-foreground text-[13px]">{label}</Text>
      <Text className="text-[13px]">{formatNaira(value)}</Text>
    </View>
  );
}

function Details({
  label = 'View prices',
  children,
}: {
  label?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <View className="mt-2.5">
      <PressableScale
        scaleTo={0.97}
        role="button"
        accessibilityState={{ expanded: open }}
        hitSlop={8}
        onPress={() => setOpen((current) => !current)}
        className="flex-row items-center gap-1 self-start">
        <Text className="text-primary text-xs font-semibold">{open ? 'Hide details' : label}</Text>
        <Icon as={ChevronDown} className={cn('text-primary size-3.5', open && 'rotate-180')} />
      </PressableScale>
      {open ? <View className="border-border mt-3 gap-3 border-t pt-3">{children}</View> : null}
    </View>
  );
}

function Lines({ lines }: { lines: PharmacyLine[] }) {
  return (
    <View className="gap-1.5">
      {lines.map((line) => (
        <View key={line.name} className="flex-row justify-between gap-3">
          <Text className="min-w-0 flex-1 text-[13px]" numberOfLines={1}>
            {line.name}
          </Text>
          <Text
            className={cn(
              'text-[13px]',
              line.have >= line.quantity ? 'text-foreground' : 'text-muted-foreground'
            )}>
            {line.have <= 0
              ? 'Not in stock'
              : line.unitPriceKobo === null
                ? 'Price on request'
                : `${line.quantity} × ${formatNaira(line.unitPriceKobo)}`}
          </Text>
        </View>
      ))}
    </View>
  );
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
        <Text className="text-sm font-extrabold">{title}</Text>
        {text ? <Text className="text-muted-foreground text-xs leading-4.5">{text}</Text> : null}
      </View>
      {children}
    </View>
  );
}

function SendAll({
  checked,
  disabled,
  title,
  onChange,
}: {
  checked: boolean;
  disabled: boolean;
  title: string;
  onChange: (next: boolean) => void;
}) {
  return (
    <PressableScale
      scaleTo={0.99}
      role="checkbox"
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      onPress={() => onChange(!checked)}
      className="bg-muted flex-row items-center gap-3 rounded-2xl p-4">
      <CheckBox checked={checked} disabled={disabled} />
      <View className="min-w-0 flex-1 gap-0.5">
        <Text className="text-[14px] leading-5 font-semibold">{title}</Text>
        <Text className="text-muted-foreground text-xs leading-4.5">
          The first to accept sends you a price. You pay only then.
        </Text>
      </View>
    </PressableScale>
  );
}

function Others({
  title,
  rows,
}: {
  title: string;
  rows: { id: string; name: string; note: string }[];
}) {
  const [open, setOpen] = React.useState(false);
  if (!rows.length) return null;
  return (
    <View className="bg-muted overflow-hidden rounded-2xl">
      <PressableScale
        scaleTo={0.99}
        role="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((current) => !current)}
        className="flex-row items-center justify-between px-4 py-3.5">
        <Text className="text-[13px] font-bold">{`${title} (${rows.length})`}</Text>
        <Icon
          as={ChevronDown}
          className={cn('text-muted-foreground size-4', open && 'rotate-180')}
        />
      </PressableScale>
      {open
        ? rows.map((row) => (
            <View
              key={row.id}
              className="border-border/70 flex-row justify-between gap-3 border-t px-4 py-3">
              <Text className="min-w-0 flex-1 text-[13px]" numberOfLines={1}>
                {row.name}
              </Text>
              <Text className="text-muted-foreground text-xs">{row.note}</Text>
            </View>
          ))
        : null}
    </View>
  );
}

type PharmacyResultsProps = {
  offers: PharmacyResult[];
  combination: PharmacyCombination | null;
  collection: Collection;
  selection: Selection;
  requestFrom: string | null;
  sendToAll: boolean;
  onSelection: (next: Selection) => void;
  onRequestFrom: (next: string | null) => void;
  onSendToAll: (next: boolean) => void;
};

export function PharmacyResults({
  offers,
  combination,
  collection,
  selection,
  requestFrom,
  sendToAll,
  onSelection,
  onRequestFrom,
  onSendToAll,
}: PharmacyResultsProps) {
  const delivery = collection === 'delivery';
  const full = offers.filter((offer) => offer.match === 'full');
  const onRequest = offers.filter((offer) => offer.match === 'none' && !offer.stockListed);
  const others = offers.filter((offer) => offer.match !== 'full' && !onRequest.includes(offer));
  const showCombination = !full.length && combination;

  return (
    <View className="gap-6">
      {full.length ? (
        <Section title="Have everything">
          {full.map((offer) => (
            <Choosable
              key={offer.id}
              selected={selection === offer.id}
              disabled={sendToAll}
              label={`Choose ${offer.name}`}
              onPress={() => onSelection(selection === offer.id ? null : offer.id)}>
              <View className="gap-1 pr-7">
                <Title name={offer.name} branch={offer.branch} />
                <Text className="text-muted-foreground text-xs">
                  {`${kilometres(offer.distanceMeters)} away${delivery ? ` · about ${minutes(offer.etaMinutes)}` : ''}`}
                </Text>
              </View>
              <Total value={offer.totalKobo} />
              <Details>
                <View className="flex-row items-center gap-1.5">
                  <Icon as={MapPin} className="text-muted-foreground size-3.5" />
                  <Text className="text-muted-foreground flex-1 text-xs">{offer.address}</Text>
                </View>
                <Lines lines={offer.lines} />
                <View className="gap-1">
                  <Money label="Medicines" value={offer.subtotalKobo} />
                  {delivery ? <Money label="Delivery" value={offer.deliveryFeeKobo} /> : null}
                  {offer.serviceFeeKobo > 0 ? (
                    <Money label="Service fee" value={offer.serviceFeeKobo} />
                  ) : null}
                </View>
              </Details>
            </Choosable>
          ))}
        </Section>
      ) : null}

      {showCombination ? (
        <Section
          title={`No single pharmacy has everything`}
          text={`These ${combination.parts.length} together do, at the lowest price.`}>
          <Choosable
            selected={selection === 'combo'}
            disabled={sendToAll}
            label={`Choose ${combination.parts.length} pharmacies together`}
            onPress={() => onSelection(selection === 'combo' ? null : 'combo')}>
            <View className="gap-1 pr-7">
              {combination.parts.map((part) => (
                <Title
                  key={part.pharmacy.id}
                  name={part.pharmacy.name}
                  branch={part.pharmacy.branch}
                />
              ))}
            </View>
            <Total value={combination.totalKobo} />
            <Details>
              {combination.parts.map((part) => (
                <View key={part.pharmacy.id} className="gap-2">
                  <Text className="text-[13px] font-bold">{part.pharmacy.name}</Text>
                  <Lines lines={part.lines} />
                  <View className="gap-1">
                    <Money label="Medicines" value={part.subtotalKobo} />
                    {delivery ? <Money label="Delivery" value={part.deliveryFeeKobo} /> : null}
                    <Money label="Service fee" value={part.serviceFeeKobo} />
                  </View>
                </View>
              ))}
              {delivery ? (
                <Text className="text-muted-foreground text-xs leading-4.5">
                  Each pharmacy sends its own rider, so each has its own delivery fee.
                </Text>
              ) : null}
            </Details>
          </Choosable>
        </Section>
      ) : null}

      {!full.length && !showCombination ? (
        <View className="bg-muted rounded-2xl px-4 py-5">
          <Text className="text-muted-foreground text-center text-[13px] leading-5">
            No pharmacy near you lists all of these medicines yet. Send your request to everyone
            nearby below.
          </Text>
        </View>
      ) : null}

      {onRequest.length ? (
        <Section title="Ask for a price" text="These pharmacies reply with an itemised price.">
          {onRequest.map((offer) => (
            <Choosable
              key={offer.id}
              selected={requestFrom === offer.id}
              disabled={sendToAll}
              label={`Ask ${offer.name} for a price`}
              onPress={() => onRequestFrom(requestFrom === offer.id ? null : offer.id)}>
              <View className="gap-1 pr-7">
                <Title name={offer.name} branch={offer.branch} />
                <Text className="text-muted-foreground text-xs">{`${kilometres(offer.distanceMeters)} away · price on request`}</Text>
              </View>
            </Choosable>
          ))}
        </Section>
      ) : null}

      <Others
        title="Other pharmacies nearby"
        rows={others.map((offer) => ({
          id: offer.id,
          name: offer.branch ? `${offer.name} · ${offer.branch}` : offer.name,
          note: offer.match === 'partial' ? 'Has some' : 'Not listed',
        }))}
      />

      {full.length ? null : (
        <SendAll
          checked={sendToAll}
          disabled={offers.length === 0}
          onChange={onSendToAll}
          title="Send my request to all pharmacies nearby"
        />
      )}
    </View>
  );
}

export const labTotalKobo = (lab: LabResult, collection: Collection) =>
  lab.subtotalKobo + (collection === 'home' && lab.matchedCount > 0 ? lab.homeFeeKobo : 0);

type LabResultsProps = {
  labs: LabResult[];
  total: number;
  collection: Collection;
  selected: string | null;
  askAll: boolean;
  onSelect: (id: string | null) => void;
  onAskAll: (next: boolean) => void;
};

export function LabResults({
  labs,
  total,
  collection,
  selected,
  askAll,
  onSelect,
  onAskAll,
}: LabResultsProps) {
  const offering = labs.filter((lab) => lab.matchedCount > 0);
  const rest = labs.filter((lab) => lab.matchedCount === 0);

  return (
    <View className="gap-6">
      {offering.length ? (
        <Section title="Laboratories that can help" text="Closest first.">
          {offering.map((lab, index) => {
            const full = lab.matchedCount === total;
            return (
              <Choosable
                key={lab.id}
                selected={selected === lab.id}
                disabled={askAll}
                label={`Choose ${lab.labName}`}
                onPress={() => onSelect(selected === lab.id ? null : lab.id)}>
                <View className="gap-1 pr-7">
                  <Title name={lab.labName} branch={lab.branchName} />
                  <Text className="text-muted-foreground text-xs">
                    {`${full ? `Offers all ${total}` : `Offers ${lab.matchedCount} of ${total}`}${lab.distanceKm === null ? '' : ` · ${lab.distanceKm.toFixed(1)} km`}${index === 0 && lab.distanceKm !== null ? ' · closest' : ''}`}
                  </Text>
                </View>
                <Total value={labTotalKobo(lab, collection)} />
                <Details>
                  <View className="flex-row items-center gap-1.5">
                    <Icon as={MapPin} className="text-muted-foreground size-3.5" />
                    <Text className="text-muted-foreground flex-1 text-xs">{lab.address}</Text>
                  </View>
                  <View className="gap-1.5">
                    {lab.matched.map((entry) => (
                      <View key={entry.requested} className="flex-row justify-between gap-3">
                        <Text
                          className={cn(
                            'min-w-0 flex-1 text-[13px]',
                            entry.priceKobo === null && 'text-muted-foreground'
                          )}
                          numberOfLines={1}>
                          {entry.requested}
                        </Text>
                        <Text
                          className={cn(
                            'text-[13px]',
                            entry.priceKobo === null && 'text-muted-foreground'
                          )}>
                          {entry.priceKobo === null ? 'Not offered' : formatNaira(entry.priceKobo)}
                        </Text>
                      </View>
                    ))}
                  </View>
                  <View className="gap-1">
                    <Money label="Tests" value={lab.subtotalKobo} />
                    {collection === 'home' ? (
                      <Money label="Home collection" value={lab.homeFeeKobo} />
                    ) : null}
                  </View>
                  <Text className="text-muted-foreground text-xs">
                    {`Results in about ${lab.turnaroundHours} hours`}
                  </Text>
                </Details>
              </Choosable>
            );
          })}
        </Section>
      ) : (
        <View className="bg-muted rounded-2xl px-4 py-5">
          <Text className="text-muted-foreground text-center text-[13px] leading-5">
            {`No laboratory near you ${collection === 'home' ? 'collects at home' : 'lists'} for these tests yet. Ask everyone nearby below.`}
          </Text>
        </View>
      )}

      <Others
        title="Other laboratories nearby"
        rows={rest.map((lab) => ({
          id: lab.id,
          name: `${lab.labName} · ${lab.branchName}`,
          note: 'Not offered',
        }))}
      />

      <SendAll
        checked={askAll}
        disabled={false}
        onChange={onAskAll}
        title="Send my request to all laboratories nearby"
      />
    </View>
  );
}
