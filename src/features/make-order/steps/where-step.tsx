import { PressableScale } from '@/components/shared/pressable-scale';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { Building2, House, Store, Truck, type LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';
import { AddressField } from '../components/address-field';
import { LocationMap } from '../components/location-map';
import type { Collection, LocationDraft, OrderKind } from '../types';

type Option = { value: Collection; title: string; hint: string; icon: LucideIcon };

const OPTIONS: Record<OrderKind, [Option, Option]> = {
  medication: [
    { value: 'delivery', title: 'Delivery', hint: 'To your door', icon: Truck },
    { value: 'pickup', title: 'Pickup', hint: 'No delivery fee', icon: Store },
  ],
  lab: [
    { value: 'home', title: 'Sample collection', hint: 'A collector visits you', icon: House },
    { value: 'lab_visit', title: 'At the lab', hint: 'You visit the facility', icon: Building2 },
  ],
};

function Choice({
  option,
  selected,
  onPress,
}: {
  option: Option;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <PressableScale
      scaleTo={0.98}
      role="radio"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      className={cn(
        'min-w-0 flex-1 gap-2.5 rounded-2xl border p-3.5',
        selected ? 'border-primary bg-secondary/50' : 'border-border bg-card'
      )}>
      <View
        className={cn(
          'size-10 items-center justify-center rounded-full',
          selected ? 'bg-primary' : 'bg-muted'
        )}>
        <Icon
          as={option.icon}
          className={cn('size-5', selected ? 'text-primary-foreground' : 'text-muted-foreground')}
        />
      </View>
      <View className="gap-0.5">
        <Text className="text-[15px] font-bold">{option.title}</Text>
        <Text className="text-xs leading-4 text-muted-foreground">{option.hint}</Text>
      </View>
    </PressableScale>
  );
}

type WhereStepProps = {
  kind: OrderKind;
  collection: Collection;
  location: LocationDraft;
  problem: string | null;
  onCollection: (value: Collection) => void;
  onLocation: (next: LocationDraft) => void;
};

export function WhereStep({
  kind,
  collection,
  location,
  problem,
  onCollection,
  onLocation,
}: WhereStepProps) {
  const withStreet = collection === 'delivery' || collection === 'home';
  const [first, second] = OPTIONS[kind];
  const lab = kind === 'lab';

  return (
    <View className="gap-6">
      <View
        role="radiogroup"
        accessibilityLabel={lab ? 'Sample collection' : 'Delivery method'}
        className="flex-row gap-3">
        <Choice
          option={first}
          selected={collection === first.value}
          onPress={() => onCollection(first.value)}
        />
        <Choice
          option={second}
          selected={collection === second.value}
          onPress={() => onCollection(second.value)}
        />
      </View>

      <AddressField
        label={withStreet ? (lab ? 'Collection address' : 'Delivery address') : 'Your location'}
        value={location}
        onChange={onLocation}
      />

      {withStreet ? <LocationMap value={location} onChange={onLocation} /> : null}

      {problem ? <Text className="text-[13px] text-destructive">{problem}</Text> : null}
    </View>
  );
}
