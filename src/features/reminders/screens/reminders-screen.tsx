import { BodyLayout } from '@/components/common/body-layout';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { CalendarClock, Plus, Search } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, View } from 'react-native';
import { ReminderFormSheet } from '../components/reminder-form-sheet';
import { ReminderRow } from '../components/reminder-row';
import { ReminderStats } from '../components/reminder-stats';
import { useReminders } from '../hooks/use-reminders';
import type { ReminderDraft, ReminderGroup } from '../types';
import { blankDraft, formatNext, nextOccurrence, stateOf } from '../utils';

type Filter = 'active' | 'inactive';
type Editing = { draft: ReminderDraft; id?: string };

export function RemindersScreen() {
  const { groups, toggle, save } = useReminders();
  const [filter, setFilter] = React.useState<Filter>('active');
  const [query, setQuery] = React.useState('');
  const [editing, setEditing] = React.useState<Editing | null>(null);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const fallbackDraft = React.useMemo(blankDraft, []);

  const rows = groups.map((group) => ({ group, state: stateOf(group) }));
  const active = rows.filter((row) => row.state === 'active');
  const inactive = rows.filter((row) => row.state !== 'active');
  const paused = rows.filter((row) => row.state === 'paused').length;

  const needle = query.trim().toLowerCase();
  const shown = (filter === 'active' ? active : inactive).filter(({ group }) =>
    `${group.meta.title} ${group.meta.dose} ${group.meta.sourceLine}`.toLowerCase().includes(needle)
  );

  const next = active
    .map(({ group }) => ({ group, at: nextOccurrence(group.meta) }))
    .filter((entry): entry is { group: ReminderGroup; at: Date } => entry.at !== null)
    .sort((a, b) => a.at.getTime() - b.at.getTime())[0];

  function openEditor(entry: Editing) {
    setEditing(entry);
    setSheetOpen(true);
  }

  const addReminder = () => openEditor({ draft: blankDraft() });

  return (
    <BodyLayout scrollView tabBar className="gap-4 pt-2">
      <View className="gap-1">
        <Text className="text-xl font-extrabold">Your reminders, together.</Text>
        <Text className="text-muted-foreground text-xs">
          Medicines, tests and everyday care. Keep the routines that matter to you in one place.
        </Text>
      </View>

      <ReminderStats
        active={active.length}
        paused={paused}
        next={next ? formatNext(next.at) : null}
        nextTitle={next?.group.meta.title}
      />

      <View className="bg-card gap-4 rounded-2xl p-4">
        <View className="flex-row items-center justify-between gap-3">
          <Text className="flex-1 text-sm font-bold">
            {`${filter === 'active' ? 'Active reminders' : 'Paused or ended'} · ${shown.length}`}
          </Text>
          <Button size="sm" variant="default" className="rounded-xl" onPress={addReminder}>
            <Icon as={Plus} className="text-primary-foreground size-3.5" />
            <Text className="text-xs">Add reminder</Text>
          </Button>
        </View>

        <View role="tablist" className="bg-muted flex-row self-start rounded-full p-0.5">
          {(['active', 'inactive'] as const).map((value) => {
            const selected = filter === value;
            return (
              <Pressable
                key={value}
                role="tab"
                accessibilityState={{ selected }}
                onPress={() => setFilter(value)}
                className={cn(
                  'h-8 flex-row items-center rounded-full px-3.5',
                  selected ? 'bg-card' : ''
                )}>
                <Text
                  className={cn(
                    'text-xs font-semibold',
                    selected ? 'text-foreground' : 'text-muted-foreground'
                  )}>
                  {value === 'active' ? 'Active' : 'Paused or ended'}
                </Text>
                <Text className="text-muted-foreground ml-1.5 text-xs">
                  {(value === 'active' ? active : inactive).length}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View className="justify-center">
          <Input
            aria-label="Search your reminders"
            placeholder="Search reminders"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            style={{ height: 40, fontSize: 14 }}
            className="bg-background rounded-full pl-10"
          />
          <View className="absolute left-3.5" pointerEvents="none">
            <Icon as={Search} className="text-muted-foreground size-4" />
          </View>
        </View>

        {shown.length ? (
          <View>
            {shown.map(({ group, state }, index) => (
              <ReminderRow
                key={group.id}
                group={group}
                state={state}
                last={index === shown.length - 1}
                onToggle={() => toggle(group.id)}
                onEdit={() => openEditor({ draft: group.meta, id: group.id })}
              />
            ))}
          </View>
        ) : (
          <View className="items-center gap-2.5 py-4">
            <View className="bg-secondary size-10 items-center justify-center rounded-full">
              <Icon as={CalendarClock} className="text-primary size-4" />
            </View>
            <Text className="text-muted-foreground text-center text-xs">
              {query
                ? 'No reminders match your search.'
                : filter === 'active'
                  ? 'No reminders yet. Add one for a medicine, a test or your own routine.'
                  : 'Paused and finished reminders will show up here.'}
            </Text>
            {!query && filter === 'active' ? (
              <Button size="sm" variant="default" className="rounded-xl" onPress={addReminder}>
                <Icon as={Plus} className="text-primary-foreground size-3.5" />
                <Text className="text-xs">Add reminder</Text>
              </Button>
            ) : null}
          </View>
        )}
      </View>

      <ReminderFormSheet
        open={sheetOpen}
        draft={editing?.draft ?? fallbackDraft}
        editing={Boolean(editing?.id)}
        onClose={() => setSheetOpen(false)}
        onSave={(draft) => save(draft, editing?.id)}
      />
    </BodyLayout>
  );
}
