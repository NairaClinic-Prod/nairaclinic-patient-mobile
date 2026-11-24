import { CheckBox } from '@/components/shared/check-box';
import { PressableScale } from '@/components/shared/pressable-scale';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { formatNaira } from '@/features/orders/utils';
import { cn } from '@/lib/utils';
import { Clock, MapPin, Route } from 'lucide-react-native';
import { View } from 'react-native';
import { Choosable } from '../components/choosable';
import type {
  Collection,
  LabResult,
  Match,
  PharmacyCombination,
  PharmacyLine,
  PharmacyResult,
} from '../types';

export type Selection = 'combo' | string | null;

const MATCH: Record<Match, { label: string; box: string; text: string }> = {
  full: { label: 'Has everything', box: 'bg-secondary', text: 'text-primary' },
  partial: { label: 'Has some', box: 'bg-warning-soft', text: 'text-warning' },
  none: { label: 'Not in their stock list', box: 'bg-muted', text: 'text-muted-foreground' },
};

const kilometres = (meters: number) =>
  meters < 1000 ? `${Math.round(meters / 10) * 10} m` : `${(meters / 1000).toFixed(1)} km`;

const minutes = (value: number) =>
  value < 60
    ? `${value} min`
    : `${Math.floor(value / 60)} hr${value % 60 ? ` ${value % 60} min` : ''}`;

function Pill({ label, box, text }: { label: string; box: string; text: string }) {
  return (
    <View className={cn('rounded-full px-2 py-0.5', box)}>
      <Text className={cn('text-[11px] font-semibold', text)}>{label}</Text>
    </View>
  );
}

function Name({ name, branch }: { name: string; branch: string | null }) {
  return (
    <View className="flex-row flex-wrap items-center gap-x-2 gap-y-1">
      <Text className="text-[15px] font-bold">{name}</Text>
      {branch ? (
        <View className="border-border rounded-full border px-2 py-0.5">
          <Text className="text-muted-foreground text-[11px] font-medium">{`${branch} branch`}</Text>
        </View>
      ) : null}
    </View>
  );
}

function Address({ text }: { text: string }) {
  return (
    <View className="mt-1 flex-row items-center gap-1">
      <Icon as={MapPin} className="text-muted-foreground size-3" />
      <Text className="text-muted-foreground flex-1 text-xs" numberOfLines={1}>
        {text}
      </Text>
    </View>
  );
}

function Travel({ offer, delivery }: { offer: PharmacyResult; delivery: boolean }) {
  return (
    <View className="mt-2 flex-row flex-wrap items-center gap-x-4 gap-y-1">
      <View className="flex-row items-center gap-1">
        <Icon as={Route} className="text-muted-foreground size-3" />
        <Text className="text-muted-foreground text-xs">
          {delivery
            ? `${kilometres(offer.distanceMeters)} from your delivery address`
            : `About ${kilometres(offer.distanceMeters)} from you`}
        </Text>
      </View>
      {delivery ? (
        <View className="flex-row items-center gap-1">
          <Icon as={Clock} className="text-muted-foreground size-3" />
          <Text className="text-muted-foreground text-xs">{`About ${minutes(offer.etaMinutes)} delivery`}</Text>
        </View>
      ) : null}
    </View>
  );
}

function lineText(line: PharmacyLine) {
  if (line.have <= 0) return { ok: false, text: 'Not in their stock list' };
  const price =
    line.unitPriceKobo === null ? 'Price on request' : `${formatNaira(line.unitPriceKobo)} each`;
  return line.have >= line.quantity
    ? { ok: true, text: `In stock · ${price}` }
    : { ok: false, text: `Only ${line.have} of ${line.quantity} · ${price}` };
}

function Lines({ lines }: { lines: PharmacyLine[] }) {
  return (
    <View className="mt-3 gap-1.5">
      {lines.map((line) => {
        const info = lineText(line);
        return (
          <View key={line.name} className="flex-row justify-between gap-3">
            <Text className="min-w-0 flex-1 text-[13px]" numberOfLines={1}>
              {line.name}
            </Text>
            <Text
              className={cn('text-[13px]', info.ok ? 'text-foreground' : 'text-muted-foreground')}>
              {info.text}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function Money({ label, value, strong }: { label: string; value: number; strong?: boolean }) {
  return (
    <View className="flex-row items-baseline justify-between">
      <Text className={cn(strong ? 'text-sm font-bold' : 'text-muted-foreground text-[13px]')}>
        {label}
      </Text>
      <Text className={cn(strong ? 'text-base font-extrabold' : 'text-[13px]')}>
        {formatNaira(value)}
      </Text>
    </View>
  );
}

function Heading({ title, text }: { title: string; text?: string }) {
  return (
    <View className="gap-0.5">
      <Text className="text-sm font-extrabold">{title}</Text>
      {text ? <Text className="text-muted-foreground text-xs leading-4.5">{text}</Text> : null}
    </View>
  );
}

function SendAll({
  checked,
  disabled,
  title,
  text,
  onChange,
}: {
  checked: boolean;
  disabled: boolean;
  title: string;
  text: string;
  onChange: (next: boolean) => void;
}) {
  return (
    <PressableScale
      scaleTo={0.99}
      role="checkbox"
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      onPress={() => onChange(!checked)}
      className="bg-card border-border flex-row items-start gap-3 rounded-2xl border p-4">
      <CheckBox checked={checked} disabled={disabled} />
      <View className="min-w-0 flex-1 gap-0.5">
        <Text className="text-[14px] leading-5 font-semibold">{title}</Text>
        <Text className="text-muted-foreground text-xs leading-4.5">{text}</Text>
      </View>
    </PressableScale>
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
    <View className="gap-5">
      <Text className="text-muted-foreground text-[13px] leading-5">
        {delivery
          ? 'Prices come from each pharmacy’s own stock list and the delivery fee is worked out for your address. '
          : 'Prices come from each pharmacy’s own stock list. '}
        {`Tap a pharmacy to choose it, then pay. The pharmacy accepts or rejects your order; if it rejects, you are refunded in full${
          delivery ? ', and a rider is only booked once it accepts' : ''
        }.`}
      </Text>

      {full.length ? (
        <View className="gap-3">
          <Heading title="Pharmacies with all your medicines" />
          {full.map((offer) => (
            <Choosable
              key={offer.id}
              selected={selection === offer.id}
              disabled={sendToAll}
              label={`Choose ${offer.name}`}
              onPress={() => onSelection(selection === offer.id ? null : offer.id)}>
              <View className="gap-0 pr-7">
                <View className="flex-row flex-wrap items-center gap-2">
                  <Name name={offer.name} branch={offer.branch} />
                  <Pill {...MATCH[offer.match]} label={MATCH[offer.match].label} />
                </View>
                <Address text={offer.address} />
                <Travel offer={offer} delivery={delivery} />
                <Lines lines={offer.lines} />
              </View>
              <View className="border-border mt-3 gap-1 border-t pt-3">
                <Money label="Medicines" value={offer.subtotalKobo} />
                {delivery ? (
                  <Money label="Delivery to your address" value={offer.deliveryFeeKobo} />
                ) : null}
                {offer.serviceFeeKobo > 0 ? (
                  <Money label="Service fee" value={offer.serviceFeeKobo} />
                ) : null}
                <Money strong label="Total you pay" value={offer.totalKobo} />
              </View>
            </Choosable>
          ))}
        </View>
      ) : null}

      {showCombination ? (
        <View className="gap-3">
          <Heading
            title={`No single pharmacy has everything. These ${combination.parts.length} together do:`}
          />
          <Choosable
            selected={selection === 'combo'}
            disabled={sendToAll}
            label={`Choose ${combination.parts.length} pharmacies together`}
            onPress={() => onSelection(selection === 'combo' ? null : 'combo')}>
            <View className="gap-4 pr-7">
              {combination.parts.map((part) => (
                <View key={part.pharmacy.id} className="gap-0">
                  <Name name={part.pharmacy.name} branch={part.pharmacy.branch} />
                  <Address text={part.pharmacy.address} />
                  <Travel offer={part.pharmacy} delivery={delivery} />
                  <Lines lines={part.lines} />
                  <View className="mt-2 gap-0.5">
                    <Money label="Medicines" value={part.subtotalKobo} />
                    {delivery ? (
                      <Money
                        label={`Delivery from ${part.pharmacy.name}`}
                        value={part.deliveryFeeKobo}
                      />
                    ) : null}
                    <Money label="Service fee" value={part.serviceFeeKobo} />
                  </View>
                </View>
              ))}
            </View>
            <View className="border-border mt-3 border-t pt-3">
              <Money strong label="Total you pay" value={combination.totalKobo} />
              {delivery ? (
                <Text className="text-muted-foreground mt-1 text-xs leading-4.5">
                  Couriers can’t collect from more than one pharmacy per trip, so each pharmacy
                  sends its own rider with its own delivery fee. This is already the cheapest mix.
                </Text>
              ) : null}
            </View>
          </Choosable>
        </View>
      ) : null}

      {!full.length && !showCombination ? (
        <View className="border-border rounded-2xl border border-dashed px-4 py-5">
          <Text className="text-muted-foreground text-center text-[13px] leading-5">
            No pharmacy near you has all of these medicines listed yet. You can send your request to
            all pharmacies around you: the first one that can supply everything takes it.
          </Text>
        </View>
      ) : null}

      {onRequest.length ? (
        <View className="gap-3">
          <Heading
            title="Ask for a price"
            text="These approved pharmacies near you haven’t listed their stock yet. Send them your request and they reply with an itemised price. You pay only if you accept it."
          />
          {onRequest.map((offer) => (
            <Choosable
              key={offer.id}
              selected={requestFrom === offer.id}
              disabled={sendToAll}
              label={`Ask ${offer.name} for a price`}
              onPress={() => onRequestFrom(requestFrom === offer.id ? null : offer.id)}>
              <View className="gap-0 pr-7">
                <View className="flex-row flex-wrap items-center gap-2">
                  <Name name={offer.name} branch={offer.branch} />
                  <Pill label="Price on request" box="bg-muted" text="text-muted-foreground" />
                </View>
                <Address text={offer.address} />
                <View className="mt-2 flex-row items-center gap-1">
                  <Icon as={Route} className="text-muted-foreground size-3" />
                  <Text className="text-muted-foreground text-xs">
                    {`About ${kilometres(offer.distanceMeters)} from you`}
                  </Text>
                </View>
              </View>
            </Choosable>
          ))}
        </View>
      ) : null}

      {others.length ? (
        <View className="gap-3">
          <Heading title="Other pharmacies near you" />
          {others.map((offer) => (
            <View key={offer.id} className="bg-card border-border rounded-2xl border p-4">
              <View className="flex-row flex-wrap items-center gap-2">
                <Name name={offer.name} branch={offer.branch} />
                <Pill {...MATCH[offer.match]} label={MATCH[offer.match].label} />
              </View>
              <Address text={offer.address} />
              {offer.match === 'none' ? null : <Lines lines={offer.lines} />}
            </View>
          ))}
        </View>
      ) : null}

      {full.length ? null : (
        <SendAll
          checked={sendToAll}
          disabled={offers.length === 0}
          onChange={onSendToAll}
          title="Send my request to all pharmacies around me"
          text="It goes to every nearby NairaClinic pharmacy that can supply everything. The first one to accept takes it and sends its price; you pay only then. If the price doesn’t suit you, cancel it and send to all again."
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
  return (
    <View className="gap-5">
      <Text className="text-muted-foreground text-[13px] leading-5">
        {`Closest laboratories that offer ${total === 1 ? 'this test' : 'these tests'}, with their published prices.${
          collection === 'home' ? ' Home collection fees are added for you.' : ''
        }`}
      </Text>

      {labs.length ? (
        <View className="gap-3">
          {labs.map((lab, index) => {
            const full = lab.matchedCount === total;
            return (
              <Choosable
                key={lab.id}
                selected={selected === lab.id}
                disabled={askAll || lab.matchedCount === 0}
                label={`Choose ${lab.labName}`}
                onPress={() => onSelect(selected === lab.id ? null : lab.id)}>
                <View className="gap-0 pr-7">
                  <Text className="text-[15px] font-bold">{lab.labName}</Text>
                  <Address text={`${lab.branchName} · ${lab.address}`} />
                  <View className="mt-2.5 flex-row flex-wrap items-center gap-1.5">
                    <Pill
                      label={
                        full
                          ? `Offers all ${total}`
                          : `Offers ${lab.matchedCount} of ${total} tests`
                      }
                      box={full ? 'bg-secondary' : 'bg-warning-soft'}
                      text={full ? 'text-success' : 'text-warning'}
                    />
                    {lab.labVisits ? (
                      <Pill label="Lab visit" box="bg-muted" text="text-muted-foreground" />
                    ) : null}
                    {lab.homeCollection ? (
                      <Pill
                        label={`Home collection ${formatNaira(lab.homeFeeKobo)}`}
                        box="bg-muted"
                        text="text-muted-foreground"
                      />
                    ) : null}
                    <Pill
                      label={`${lab.distanceKm.toFixed(1)} km away${index === 0 ? ' · closest' : ''}`}
                      box={index === 0 ? 'bg-secondary' : 'bg-muted'}
                      text={index === 0 ? 'text-primary' : 'text-muted-foreground'}
                    />
                  </View>
                  <View className="mt-3 gap-1.5">
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
                            entry.priceKobo === null ? 'text-muted-foreground' : 'text-foreground'
                          )}>
                          {entry.priceKobo === null ? 'Not offered' : formatNaira(entry.priceKobo)}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
                {lab.matchedCount > 0 ? (
                  <View className="border-border mt-3 gap-1 border-t pt-3">
                    <Money label="Tests" value={lab.subtotalKobo} />
                    {collection === 'home' ? (
                      <Money label="Home collection" value={lab.homeFeeKobo} />
                    ) : null}
                    <Money strong label="Total you pay" value={labTotalKobo(lab, collection)} />
                    <Text className="text-muted-foreground mt-0.5 text-xs">
                      {`Results in about ${lab.turnaroundHours} hours`}
                    </Text>
                  </View>
                ) : null}
              </Choosable>
            );
          })}
        </View>
      ) : (
        <View className="border-border rounded-2xl border border-dashed px-4 py-6">
          <Text className="text-muted-foreground text-center text-[13px] leading-5">
            {`No laboratory near you ${collection === 'home' ? 'collects samples at home' : 'lists'} for these tests yet. You can ask all laboratories for a price below.`}
          </Text>
        </View>
      )}

      <SendAll
        checked={askAll}
        disabled={false}
        onChange={onAskAll}
        title="Send my request to all laboratories around me"
        text="Can’t find what you need? It goes to every nearby NairaClinic laboratory. Those that do your tests reply with a price, and you pay only if you accept it."
      />
    </View>
  );
}
