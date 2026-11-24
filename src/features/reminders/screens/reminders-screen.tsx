import { FadeIn } from '@/components/shared/fade-in';
import { BodyLayout } from '@/components/common/body-layout';
import TabHeader from '@/components/common/header';
import { AddButton } from '@/components/shared/add-button';
import { SegmentedControl } from '@/components/shared/segmented-control';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { CalendarClock, Plus, Search } from 'lucide-react-native';
import { useFocusEffect } from 'expo-router';
import * as React from 'react';
import { View } from 'react-native';
import { NextUpCard } from '../components/next-up-card';
import { CalendarPromptSheet } from '../components/calendar-prompt-sheet';
import { CalendarRow } from '../components/calendar-row';
import { ReminderFormSheet } from '../components/reminder-form-sheet';
import { ReminderRow } from '../components/reminder-row';
import { shouldAskNow, useCalendarPrompt } from '../hooks/use-calendar-prompt';
import { useReminders } from '../hooks/use-reminders';
import type { ReminderDraft, ReminderGroup } from '../types';
import { blankDraft, formatNext, nextOccurrence, stateOf } from '../utils';

type Filter = 'active' | 'inactive';
type Editing = { draft: ReminderDraft; id?: string };

const SEARCH_FROM = 6;

export function RemindersScreen() {
  const { groups, toggle, save } = useReminders();
  const calendar = useCalendarPrompt();
  const [calendarOpen, setCalendarOpen] = React.useState(false);
  const [filter, setFilter] = React.useState<Filter>('active');
  const [query, setQuery] = React.useState('');
  const [editing, setEditing] = React.useState<Editing | null>(null);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const fallbackDraft = React.useMemo(blankDraft, []);

  const rows = groups.map((group) => ({ group, state: stateOf(group) }));
  const active = rows.filter((row) => row.state === 'active');
  const inactive = rows.filter((row) => row.state !== 'active');

  const needle = query.trim().toLowerCase();
  const shown = (filter === 'active' ? active : inactive).filter(({ group }) =>
    `${group.meta.title} ${group.meta.dose} ${group.meta.sourceLine}`.toLowerCase().includes(needle)
  );

  const next = active
    .map(({ group }) => ({ group, at: nextOccurrence(group.meta) }))
    .filter((entry): entry is { group: ReminderGroup; at: Date } => entry.at !== null)
    .sort((a, b) => a.at.getTime() - b.at.getTime())[0];

  useFocusEffect(
    React.useCallback(() => {
      if (!calendar.ready) return;
      const timer = setTimeout(() => {
        if (shouldAskNow()) setCalendarOpen(true);
      }, 700);
      return () => clearTimeout(timer);
    }, [calendar.ready])
  );

  function openEditor(entry: Editing) {
    setEditing(entry);
    setSheetOpen(true);
  }

  const addReminder = () => openEditor({ draft: blankDraft() });

  return (
    <BodyLayout scrollView tabBar className="gap-3">
      <TabHeader
        title="Reminders"
        subtitle={active.length === 1 ? '1 active reminder' : `${active.length} active reminders`}
        right={<AddButton label="Add reminder" onPress={addReminder} />}
      />

      {next ? (
        <FadeIn index={0}>
          <NextUpCard
            when={formatNext(next.at)}
            title={next.group.meta.title}
            detail={next.group.meta.dose}
          />
        </FadeIn>
      ) : null}

      <CalendarRow connected={calendar.connected} onPress={() => setCalendarOpen(true)} />

      <FadeIn index={1}>
        <SegmentedControl
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'active', label: 'Active', count: active.length },
            { value: 'inactive', label: 'Paused or ended', count: inactive.length },
          ]}
        />
      </FadeIn>

      {groups.length >= SEARCH_FROM ? (
        <View className="justify-center">
          <Input
            aria-label="Search your reminders"
            placeholder="Search reminders"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            style={{ height: 40, fontSize: 14 }}
            className="bg-card rounded-full pl-10"
          />
          <View className="absolute left-3.5" pointerEvents="none">
            <Icon as={Search} className="text-muted-foreground size-4" />
          </View>
        </View>
      ) : null}

      <FadeIn index={2} className="bg-card overflow-hidden rounded-2xl">
        {shown.length ? (
          shown.map(({ group, state }, index) => (
            <ReminderRow
              key={group.id}
              group={group}
              state={state}
              last={index === shown.length - 1}
              onToggle={() => toggle(group.id)}
              onOpen={() => openEditor({ draft: group.meta, id: group.id })}
            />
          ))
        ) : (
          <View className="items-center gap-2.5 px-6 py-8">
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
      </FadeIn>

      <ReminderFormSheet
        open={sheetOpen}
        draft={editing?.draft ?? fallbackDraft}
        editing={Boolean(editing?.id)}
        onClose={() => setSheetOpen(false)}
        onSave={(draft) => {
          const failure = save(draft, editing?.id);
          if (!failure) {
            setTimeout(() => {
              if (shouldAskNow()) setCalendarOpen(true);
            }, 900);
          }
          return failure;
        }}
      />
      <CalendarPromptSheet open={calendarOpen} onClose={() => setCalendarOpen(false)} />
    </BodyLayout>
  );
}
