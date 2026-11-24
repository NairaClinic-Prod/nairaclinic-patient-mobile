import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useColor } from '@/hooks/use-color';
import { cn } from '@/lib/utils';
import * as Haptics from 'expo-haptics';
import { Bell, FlaskConical, Pill, type LucideIcon } from 'lucide-react-native';
import { Pressable, Switch, View } from 'react-native';
import { REPEAT_LABEL } from '../constants';
import type { ReminderGroup, ReminderKind, ReminderState } from '../types';

const ICON: Record<ReminderKind, LucideIcon> = {
  medication: Pill,
  lab: FlaskConical,
  general: Bell,
};

type ReminderRowProps = {
  group: ReminderGroup;
  state: ReminderState;
  last: boolean;
  onOpen: () => void;
  onToggle: () => void;
};

export function ReminderRow({ group, state, last, onOpen, onToggle }: ReminderRowProps) {
  const color = useColor();
  const { meta } = group;
  const summary = `${meta.times.join(' · ')} · ${REPEAT_LABEL[meta.repeat]}`;

  return (
    <View
      className={cn('border-border h-16 flex-row items-center', last ? '' : 'border-b')}>
      <Pressable
        role="button"
        accessibilityLabel={`View or edit ${meta.title}`}
        onPress={onOpen}
        className="h-full flex-1 flex-row items-center gap-3 pl-3.5 active:opacity-70">
        <View
          className={cn(
            'size-10 items-center justify-center rounded-full',
            state === 'active' ? 'bg-secondary' : 'bg-muted'
          )}>
          <Icon
            as={ICON[meta.kind]}
            className={cn(
              'size-[18px]',
              state === 'active' ? 'text-primary' : 'text-muted-foreground'
            )}
          />
        </View>
        <View className="flex-1 gap-0.5">
          <Text
            className={cn('text-[13px] font-bold', state === 'active' ? '' : 'text-muted-foreground')}
            numberOfLines={1}>
            {meta.title}
          </Text>
          <Text className="text-muted-foreground text-[11px]" numberOfLines={1}>
            {state === 'ended' ? `Ended · ${summary}` : summary}
          </Text>
        </View>
      </Pressable>
      <View className="w-[64px] items-center">
        {state === 'ended' ? null : (
          <Switch
            accessibilityLabel={`${state === 'active' ? 'Pause' : 'Resume'} ${meta.title}`}
            value={state === 'active'}
            onValueChange={() => {
              Haptics.selectionAsync();
              onToggle();
            }}
            trackColor={{ false: color.border, true: color.primary }}
            ios_backgroundColor={color.border}
            style={{ transform: [{ scale: 0.8 }] }}
          />
        )}
      </View>
    </View>
  );
}
