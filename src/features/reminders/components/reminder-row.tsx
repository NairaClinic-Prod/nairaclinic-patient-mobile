import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { Bell, FlaskConical, Pill, type LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';
import { REPEAT_LABEL } from '../constants';
import type { ReminderGroup, ReminderKind, ReminderState } from '../types';
import { dateLabel } from '../utils';

const ICON: Record<ReminderKind, LucideIcon> = {
  medication: Pill,
  lab: FlaskConical,
  general: Bell,
};

const STATE_LABEL: Record<ReminderState, string> = {
  active: 'Active',
  paused: 'Paused',
  ended: 'Ended',
};

type ReminderRowProps = {
  group: ReminderGroup;
  state: ReminderState;
  last: boolean;
  onEdit: () => void;
  onToggle: () => void;
};

export function ReminderRow({ group, state, last, onEdit, onToggle }: ReminderRowProps) {
  const { meta } = group;
  const detail = [meta.dose, meta.frequency].filter(Boolean).join(' · ');
  const range = meta.startDate
    ? `${dateLabel(meta.startDate)}${
        meta.endDate && meta.endDate !== meta.startDate ? ` – ${dateLabel(meta.endDate)}` : ''
      }`
    : '';

  return (
    <View className={cn('border-border flex-row gap-3 py-4', last ? '' : 'border-b')}>
      <View className="bg-secondary size-9 items-center justify-center rounded-xl">
        <Icon as={ICON[meta.kind]} className="text-secondary-foreground size-4" />
      </View>
      <View className="flex-1 gap-1">
        <Text className="text-sm font-bold">{meta.title}</Text>
        {detail ? <Text className="text-muted-foreground text-xs">{detail}</Text> : null}
        {meta.sourceLine ? (
          <Text className="text-muted-foreground text-xs">{meta.sourceLine}</Text>
        ) : null}
        <View className="mt-1 flex-row flex-wrap items-center gap-2">
          <View
            className={cn(
              'rounded-md border px-2 py-0.5',
              state === 'active' ? 'bg-secondary border-success/20' : 'bg-muted border-border'
            )}>
            <Text
              className={cn(
                'text-[11px] font-semibold',
                state === 'active' ? 'text-success' : 'text-muted-foreground'
              )}>
              {STATE_LABEL[state]}
            </Text>
          </View>
          {meta.times.length ? (
            <Text className="text-xs font-semibold">{`${meta.times.join(', ')} WAT`}</Text>
          ) : null}
          <Text className="text-muted-foreground text-xs">{REPEAT_LABEL[meta.repeat]}</Text>
        </View>
        {range ? <Text className="text-muted-foreground text-xs">{range}</Text> : null}
        <View className="mt-2 flex-row gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="rounded-xl"
            accessibilityLabel={`View or edit ${meta.title}`}
            onPress={onEdit}>
            <Text className="text-xs">View / edit</Text>
          </Button>
          {state !== 'ended' ? (
            <Button
              variant="ghost"
              size="sm"
              className="rounded-xl"
              accessibilityLabel={`${state === 'active' ? 'Pause' : 'Resume'} ${meta.title}`}
              onPress={onToggle}>
              <Text className="text-primary text-xs">{state === 'active' ? 'Pause' : 'Resume'}</Text>
            </Button>
          ) : null}
        </View>
      </View>
    </View>
  );
}
