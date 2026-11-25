import { ActionButton } from '@/components/shared/action-button';
import { PressableScale } from '@/components/shared/pressable-scale';
import { TextField } from '@/components/shared/text-field';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import {
  HAS_PLACES_KEY,
  locateMe,
  placeDetails,
  searchPlaces,
  type PlaceFound,
  type PlaceHit,
} from '@/lib/places';
import { LocateFixed, MapPin, PencilLine } from 'lucide-react-native';
import * as React from 'react';
import { View } from 'react-native';
import type { LocationDraft } from '../types';

type AddressFieldProps = {
  label: string;
  value: LocationDraft;
  onChange: (next: LocationDraft) => void;
};

const apply = (value: LocationDraft, found: PlaceFound): LocationDraft => ({
  ...value,
  address: found.address,
  state: found.state,
  lga: found.lga,
  city: found.city,
  point: found.point,
  typed: false,
});

export function AddressField({ label, value, onChange }: AddressFieldProps) {
  const [hits, setHits] = React.useState<PlaceHit[]>([]);
  const [searching, setSearching] = React.useState(false);
  const [locating, setLocating] = React.useState(false);
  const [problem, setProblem] = React.useState<string | null>(null);
  const request = React.useRef(0);

  const query = value.address.trim();
  const typedEnough = HAS_PLACES_KEY && query.length >= 3 && !value.point && !value.typed;

  React.useEffect(() => {
    const id = ++request.current;
    if (!typedEnough) {
      setHits([]);
      return;
    }
    const timer = setTimeout(() => {
      setSearching(true);
      searchPlaces(query)
        .then((found) => {
          if (id !== request.current) return;
          setHits(found.slice(0, 5));
          setProblem(null);
        })
        .catch(
          () =>
            id === request.current &&
            setProblem('Address suggestions are not loading. Use your current location instead.')
        )
        .finally(() => id === request.current && setSearching(false));
    }, 250);
    return () => clearTimeout(timer);
  }, [typedEnough, query]);

  async function choose(hit: PlaceHit) {
    setHits([]);
    try {
      onChange(apply(value, await placeDetails(hit.id)));
      setProblem(null);
    } catch (failure) {
      setProblem(failure instanceof Error ? failure.message : 'We could not load that address.');
    }
  }

  async function locate() {
    setHits([]);
    setLocating(true);
    setProblem(null);
    try {
      onChange(apply(value, await locateMe()));
    } catch (failure) {
      setProblem(failure instanceof Error ? failure.message : 'We could not get your location.');
    } finally {
      setLocating(false);
    }
  }

  return (
    <View className="gap-2.5">
      <TextField
        sheet
        revealTop
        tone="muted"
        label={label}
        required
        maxLength={240}
        autoCorrect={false}
        placeholder={HAS_PLACES_KEY ? 'Start typing your street' : 'Street, area and town'}
        value={value.address}
        onChangeText={(address) => onChange({ ...value, address, point: undefined, typed: false })}
        hint={value.point ? 'Pinned on the map.' : undefined}
      />

      {typedEnough ? (
        <View className="overflow-hidden rounded-2xl bg-muted">
          {hits.map((hit, index) => (
            <PressableScale
              key={hit.id}
              scaleTo={0.99}
              role="button"
              onPress={() => choose(hit)}
              className={`flex-row items-center gap-3 px-3.5 py-3 ${index ? 'border-t border-border/70' : ''}`}>
              <Icon as={MapPin} className="size-4 text-primary" />
              <View className="min-w-0 flex-1">
                <Text className="text-[13px] font-semibold" numberOfLines={1}>
                  {hit.main}
                </Text>
                {hit.secondary ? (
                  <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                    {hit.secondary}
                  </Text>
                ) : null}
              </View>
            </PressableScale>
          ))}
          {searching ? (
            <Text className="px-3.5 py-3 text-xs text-muted-foreground">Searching…</Text>
          ) : (
            <PressableScale
              scaleTo={0.99}
              role="button"
              onPress={() => {
                setHits([]);
                onChange({ ...value, typed: true });
              }}
              className={`flex-row items-center gap-3 px-3.5 py-3 ${hits.length ? 'border-t border-border/70' : ''}`}>
              <Icon as={PencilLine} className="size-4 text-muted-foreground" />
              <Text className="flex-1 text-[13px]" numberOfLines={1}>
                {`Use “${query}” as typed`}
              </Text>
            </PressableScale>
          )}
        </View>
      ) : null}

      {problem ? <Text className="text-xs leading-4.5 text-destructive">{problem}</Text> : null}

      <ActionButton
        size="md"
        variant="ghost"
        className="self-start"
        icon={LocateFixed}
        label={locating ? 'Finding you…' : 'Use my current location'}
        disabled={locating}
        onPress={locate}
      />
    </View>
  );
}
