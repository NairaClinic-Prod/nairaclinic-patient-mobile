import {
  BottomSheet,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { SCREEN_PADDING_X } from '@/constants/ui';
import { useColor } from '@/hooks/use-color';
import { FONT } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { Plus, X } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, View } from 'react-native';
import { MAX_TIMES, REPEAT_OPTIONS, WEEKDAYS } from '../constants';
import type { ReminderDraft } from '../types';
import { dateLabel, isDateKey, missingFor } from '../utils';

const SNAP_POINTS = ['92%'];

function SheetInput(props: React.ComponentProps<typeof BottomSheetTextInput>) {
  const color = useColor();
  return (
    <BottomSheetTextInput
      placeholderTextColor={color.mutedForeground}
      {...props}
      style={[
        {
          height: 44,
          borderRadius: 22,
          borderWidth: 1,
          borderColor: color.border,
          backgroundColor: color.background,
          paddingHorizontal: 16,
          fontSize: 14,
          color: color.foreground,
          fontFamily: FONT.regular,
        },
        props.style,
      ]}
    />
  );
}

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      role="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      className={cn(
        'rounded-full border px-3.5 py-2 active:opacity-70',
        selected ? 'bg-primary border-primary' : 'bg-background border-border'
      )}>
      <Text
        className={cn(
          'text-xs font-semibold',
          selected ? 'text-primary-foreground' : 'text-foreground'
        )}>
        {label}
      </Text>
    </Pressable>
  );
}

function maskTime(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}:${digits.slice(2)}` : digits;
}

function maskDate(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length > 6) return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
  if (digits.length > 4) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  return digits;
}

type ReminderFormSheetProps = {
  open: boolean;
  draft: ReminderDraft;
  editing: boolean;
  onClose: () => void;
  onSave: (draft: ReminderDraft) => string | null;
};

export function ReminderFormSheet({ open, draft: initial, editing, onClose, onSave }: ReminderFormSheetProps) {
  const [draft, setDraft] = React.useState(initial);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setDraft(initial);
      setError(null);
    }
  }, [open, initial]);

  const personal = draft.kind === 'general';
  const test = draft.kind === 'lab';
  const missing = missingFor(draft);
  const patch = (change: Partial<ReminderDraft>) => setDraft((current) => ({ ...current, ...change }));

  function save() {
    const failure = onSave(draft);
    if (failure) setError(failure);
    else onClose();
  }

  const facts = test
    ? [{ label: 'Test', value: draft.title }]
    : [
        { label: 'Dose', value: draft.dose || '—' },
        { label: 'How often', value: draft.frequency || '—' },
        { label: 'Course', value: isDateKey(draft.endDate) ? `Ends ${dateLabel(draft.endDate)}` : '—' },
      ];

  return (
    <BottomSheet open={open} onClose={onClose} snapPoints={SNAP_POINTS}>
      <BottomSheetScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: SCREEN_PADDING_X, paddingBottom: 48, gap: 20 }}>
        <View className="gap-1">
          <Text className="text-lg font-extrabold">
            {personal && !editing ? 'New reminder' : draft.title || 'New reminder'}
          </Text>
          <Text className="text-muted-foreground text-xs">
            {personal ? 'Personal reminder' : draft.sourceLine}
          </Text>
        </View>

        {personal ? (
          <View className="gap-4">
            <View className="gap-1.5">
              <Text className="text-xs font-semibold">Title</Text>
              <SheetInput
                maxLength={120}
                placeholder="e.g. Drink water"
                value={draft.title}
                onChangeText={(title) => patch({ title })}
              />
            </View>
            <View className="gap-1.5">
              <Text className="text-xs font-semibold">
                Note <Text className="text-muted-foreground text-xs font-normal">Optional</Text>
              </Text>
              <SheetInput
                multiline
                maxLength={300}
                value={draft.note}
                onChangeText={(note) => patch({ note })}
                style={{ height: 84, borderRadius: 18, paddingTop: 12, textAlignVertical: 'top' }}
              />
            </View>
          </View>
        ) : (
          <View className="bg-muted/50 flex-row rounded-2xl py-3">
            {facts.map((fact, index) => (
              <View
                key={fact.label}
                className={cn('flex-1 px-3', index > 0 ? 'border-border/70 border-l' : '')}>
                <Text className="text-muted-foreground text-[11px]">{fact.label}</Text>
                <Text className="mt-0.5 text-xs font-semibold">{fact.value}</Text>
              </View>
            ))}
          </View>
        )}

        <View className="gap-3">
          <View className="flex-row items-baseline justify-between">
            <Text className="text-sm font-bold">Remind me at</Text>
            <Text className="text-muted-foreground text-[11px]">West Africa Time</Text>
          </View>
          <View className="flex-row flex-wrap items-center gap-2">
            {draft.times.map((time, index) => (
              <View key={index} className="flex-row items-center gap-1.5">
                <SheetInput
                  accessibilityLabel={`Reminder time ${index + 1}`}
                  keyboardType="number-pad"
                  placeholder="08:00"
                  maxLength={5}
                  value={time}
                  onChangeText={(value) =>
                    patch({
                      times: draft.times.map((current, i) => (i === index ? maskTime(value) : current)),
                    })
                  }
                  style={{ width: 92, textAlign: 'center' }}
                />
                {draft.times.length > 1 ? (
                  <Pressable
                    hitSlop={8}
                    accessibilityLabel={`Remove time ${index + 1}`}
                    onPress={() => patch({ times: draft.times.filter((_, i) => i !== index) })}
                    className="size-7 items-center justify-center rounded-full active:opacity-60">
                    <Icon as={X} className="text-destructive size-4" />
                  </Pressable>
                ) : null}
              </View>
            ))}
            {!test && draft.times.length < MAX_TIMES ? (
              <Pressable
                onPress={() => patch({ times: [...draft.times, '12:00'] })}
                className="border-border flex-row items-center gap-1.5 rounded-full border border-dashed px-3.5 py-3 active:opacity-70">
                <Icon as={Plus} className="text-primary size-4" />
                <Text className="text-primary text-xs font-semibold">Add time</Text>
              </Pressable>
            ) : null}
          </View>

          {personal ? (
            <View className="gap-2">
              <Text className="text-xs font-semibold">Repeat</Text>
              <View className="flex-row flex-wrap gap-2">
                {REPEAT_OPTIONS.map((option) => (
                  <Chip
                    key={option.value}
                    label={option.label}
                    selected={draft.repeat === option.value}
                    onPress={() => patch({ repeat: option.value })}
                  />
                ))}
              </View>
            </View>
          ) : null}
          {personal && draft.repeat === 'days' ? (
            <View className="flex-row flex-wrap gap-2">
              {WEEKDAYS.map((day) => (
                <Chip
                  key={day.value}
                  label={day.label}
                  selected={draft.weekdays.includes(day.value)}
                  onPress={() =>
                    patch({
                      weekdays: draft.weekdays.includes(day.value)
                        ? draft.weekdays.filter((value) => value !== day.value)
                        : [...draft.weekdays, day.value],
                    })
                  }
                />
              ))}
            </View>
          ) : null}
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1 gap-1.5">
            <Text className="text-xs font-semibold">{test ? 'Date' : 'From'}</Text>
            <SheetInput
              keyboardType="number-pad"
              placeholder="YYYY-MM-DD"
              maxLength={10}
              value={draft.startDate}
              onChangeText={(value) => {
                const startDate = maskDate(value);
                patch({
                  startDate,
                  endDate:
                    test || draft.repeat === 'once' || draft.endDate < startDate
                      ? startDate
                      : draft.endDate,
                });
              }}
            />
          </View>
          {!test && draft.repeat !== 'once' ? (
            <View className="flex-1 gap-1.5">
              <Text className="text-xs font-semibold">Until</Text>
              <SheetInput
                keyboardType="number-pad"
                placeholder="YYYY-MM-DD"
                maxLength={10}
                value={draft.endDate}
                onChangeText={(value) => patch({ endDate: maskDate(value) })}
              />
            </View>
          ) : null}
        </View>

        {error ? (
          <Text role="alert" className="bg-warning-soft text-warning rounded-xl px-4 py-3 text-xs">
            {error}
          </Text>
        ) : null}

        <View className="border-border/70 gap-3 border-t pt-4">
          <Text
            className={cn(
              'text-center text-[11px]',
              missing.length ? 'text-destructive' : 'text-muted-foreground'
            )}>
            {missing.length
              ? `Still needed: ${missing.join(', ')}`
              : 'Alerts arrive in NairaClinic and on WhatsApp.'}
          </Text>
          <View className="flex-row gap-2">
            <Button variant="ghost" className="flex-1 rounded-2xl" onPress={onClose}>
              <Text>Cancel</Text>
            </Button>
            <Button
              variant="default"
              className="flex-1 rounded-2xl"
              disabled={missing.length > 0}
              onPress={save}>
              <Text>Save reminder</Text>
            </Button>
          </View>
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}
