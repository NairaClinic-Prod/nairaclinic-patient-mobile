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
import * as Haptics from 'expo-haptics';
import {
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  CalendarRange,
  Check,
  Clock,
  FlaskConical,
  Pill,
  Plus,
  Repeat,
  X,
  type LucideIcon,
} from 'lucide-react-native';
import * as React from 'react';
import { Pressable, View } from 'react-native';
import { useSheetBottom } from '@/hooks/use-screen-insets';
import { MAX_TIMES, REPEAT_OPTIONS, WEEKDAYS } from '../constants';
import type { ReminderDraft, ReminderRepeat } from '../types';
import { dateLabel, isDateKey, missingFor, todayKey } from '../utils';
import { DateField, TimeField } from './reminder-pickers';

const SNAP_POINTS = ['92%'];

const REPEAT_COPY: Record<ReminderRepeat, { subtitle: string; icon: LucideIcon }> = {
  daily: { subtitle: 'An alert every day until the end date', icon: Repeat },
  days: { subtitle: 'Pick the days of the week', icon: CalendarRange },
  once: { subtitle: 'A single alert on the start date', icon: CalendarCheck },
};

function IconBadge({ icon, className }: { icon: LucideIcon; className?: string }) {
  return (
    <View className={cn('bg-card size-9 items-center justify-center rounded-full', className)}>
      <Icon as={icon} className="text-foreground size-[17px]" />
    </View>
  );
}

function FieldInput(props: React.ComponentProps<typeof BottomSheetTextInput>) {
  const color = useColor();
  return (
    <BottomSheetTextInput
      placeholderTextColor={color.mutedForeground}
      {...props}
      style={[
        {
          height: 28,
          padding: 0,
          fontSize: 14,
          color: color.foreground,
          fontFamily: FONT.bold,
        },
        props.style,
      ]}
    />
  );
}

type ReminderFormSheetProps = {
  open: boolean;
  draft: ReminderDraft;
  editing: boolean;
  onClose: () => void;
  onSave: (draft: ReminderDraft) => string | null;
};

export function ReminderFormSheet({
  open,
  draft: initial,
  editing,
  onClose,
  onSave,
}: ReminderFormSheetProps) {
  const sheetBottom = useSheetBottom();
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
  const patch = (change: Partial<ReminderDraft>) =>
    setDraft((current) => ({ ...current, ...change }));

  function save() {
    const failure = onSave(draft);
    if (failure) setError(failure);
    else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onClose();
    }
  }

  const facts = test
    ? [{ label: 'Test', value: draft.title, icon: FlaskConical }]
    : [
        { label: 'Dose', value: draft.dose || '—', icon: Pill },
        { label: 'How often', value: draft.frequency || '—', icon: Repeat },
        {
          label: 'Course',
          value: isDateKey(draft.endDate) ? `Ends ${dateLabel(draft.endDate)}` : '—',
          icon: CalendarCheck,
        },
      ];

  return (
    <BottomSheet open={open} onClose={onClose} snapPoints={SNAP_POINTS}>
      <View style={{ flex: 1 }}>
        <BottomSheetScrollView
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: SCREEN_PADDING_X,
            paddingTop: 8,
            paddingBottom: 0,
            gap: 18,
          }}>
          <View className="gap-0.5">
            <Text className="text-xl font-extrabold">
              {personal && !editing ? 'New reminder' : draft.title || 'New reminder'}
            </Text>
            <Text className="text-muted-foreground text-xs">
              {personal ? 'Personal reminder' : draft.sourceLine}
            </Text>
          </View>

          {personal ? (
            <View className="gap-2.5">
              <View className="bg-muted gap-1 rounded-3xl px-4 py-3">
                <Text className="text-muted-foreground text-[11px]">Title</Text>
                <FieldInput
                  maxLength={120}
                  placeholder="e.g. Drink water"
                  value={draft.title}
                  onChangeText={(title) => patch({ title })}
                />
              </View>
              <View className="bg-muted gap-1 rounded-3xl px-4 py-3">
                <Text className="text-muted-foreground text-[11px]">Note · optional</Text>
                <FieldInput
                  multiline
                  maxLength={300}
                  value={draft.note}
                  onChangeText={(note) => patch({ note })}
                  style={{
                    height: 52,
                    fontFamily: FONT.regular,
                    textAlignVertical: 'top',
                  }}
                />
              </View>
            </View>
          ) : (
            <View className="flex-row gap-2.5">
              {facts.map((fact) => (
                <View key={fact.label} className="bg-muted flex-1 gap-2 rounded-3xl p-3">
                  <IconBadge icon={fact.icon} />
                  <View>
                    <Text className="text-muted-foreground text-[11px]">{fact.label}</Text>
                    <Text className="mt-0.5 text-xs leading-4 font-bold" numberOfLines={2}>
                      {fact.value}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          <View className="gap-2.5">
            <View className="flex-row items-baseline justify-between">
              <Text className="text-sm font-bold">Remind me at</Text>
              <Text className="text-muted-foreground text-[11px]">West Africa Time</Text>
            </View>
            <View className="flex-row flex-wrap gap-2.5">
              {draft.times.map((time, index) => (
                <View key={index} className="bg-muted w-[48.4%] gap-2 rounded-3xl p-3">
                  <View className="flex-row items-center justify-between">
                    <IconBadge icon={Clock} />
                    {draft.times.length > 1 ? (
                      <Pressable
                        hitSlop={10}
                        accessibilityLabel={`Remove time ${index + 1}`}
                        onPress={() => patch({ times: draft.times.filter((_, i) => i !== index) })}
                        className="bg-card size-7 items-center justify-center rounded-full active:opacity-60">
                        <Icon as={X} className="text-destructive size-3.5" />
                      </Pressable>
                    ) : null}
                  </View>
                  <TimeField
                    label={`Reminder time ${index + 1}`}
                    value={time}
                    onChange={(value) =>
                      patch({
                        times: draft.times.map((current, i) => (i === index ? value : current)),
                      })
                    }
                  />
                </View>
              ))}
              {!test && draft.times.length < MAX_TIMES ? (
                <Pressable
                  onPress={() => patch({ times: [...draft.times, '12:00'] })}
                  className="border-border w-[48.4%] items-center justify-center gap-1.5 rounded-3xl border border-dashed p-3 active:opacity-70">
                  <Icon as={Plus} className="text-primary size-5" />
                  <Text className="text-primary text-xs font-bold">Add time</Text>
                </Pressable>
              ) : null}
            </View>
          </View>

          {personal ? (
            <View className="gap-2.5">
              <Text className="text-sm font-bold">Repeat</Text>
              <View className="bg-muted overflow-hidden rounded-3xl">
                {REPEAT_OPTIONS.map((option, index) => {
                  const selected = draft.repeat === option.value;
                  const copy = REPEAT_COPY[option.value];
                  return (
                    <Pressable
                      key={option.value}
                      role="button"
                      accessibilityState={{ selected }}
                      onPress={() => {
                        Haptics.selectionAsync();
                        patch({ repeat: option.value });
                      }}
                      className={cn(
                        'border-border/70 flex-row items-center gap-3 px-3 py-3 active:opacity-70',
                        index < REPEAT_OPTIONS.length - 1 ? 'border-b' : ''
                      )}>
                      <IconBadge icon={copy.icon} />
                      <View className="flex-1">
                        <Text className="text-[13px] font-bold">{option.label}</Text>
                        <Text className="text-muted-foreground mt-0.5 text-[11px]">
                          {copy.subtitle}
                        </Text>
                      </View>
                      {selected ? (
                        <View className="bg-primary size-5 items-center justify-center rounded-full">
                          <Icon as={Check} className="text-primary-foreground size-3" />
                        </View>
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
              {draft.repeat === 'days' ? (
                <View className="flex-row gap-1.5">
                  {WEEKDAYS.map((day) => {
                    const selected = draft.weekdays.includes(day.value);
                    return (
                      <Pressable
                        key={day.value}
                        role="button"
                        accessibilityState={{ selected }}
                        onPress={() => {
                          Haptics.selectionAsync();
                          patch({
                            weekdays: selected
                              ? draft.weekdays.filter((value) => value !== day.value)
                              : [...draft.weekdays, day.value],
                          });
                        }}
                        className={cn(
                          'h-11 flex-1 items-center justify-center rounded-full border active:opacity-70',
                          selected ? 'bg-primary border-primary' : 'bg-muted border-transparent'
                        )}>
                        <Text
                          className={cn(
                            'text-[11px] font-bold',
                            selected ? 'text-primary-foreground' : 'text-foreground'
                          )}>
                          {day.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}
            </View>
          ) : null}

          <View className="flex-row gap-2.5">
            <View className="bg-muted flex-1 gap-2 rounded-3xl p-3">
              <View className="flex-row items-center gap-2.5">
                <IconBadge icon={CalendarDays} />
                <Text className="text-muted-foreground text-[11px]">{test ? 'Date' : 'From'}</Text>
              </View>
              <View>
                <DateField
                  label={test ? 'Date' : 'From'}
                  value={draft.startDate}
                  minimum={editing ? undefined : todayKey()}
                  onChange={(startDate) =>
                    patch({
                      startDate,
                      endDate:
                        test || draft.repeat === 'once' || draft.endDate < startDate
                          ? startDate
                          : draft.endDate,
                    })
                  }
                />
              </View>
            </View>
            {!test && draft.repeat !== 'once' ? (
              <View className="bg-muted flex-1 gap-2 rounded-3xl p-3">
                <View className="flex-row items-center gap-2.5">
                  <IconBadge icon={CalendarClock} />
                  <Text className="text-muted-foreground text-[11px]">Until</Text>
                </View>
                <View>
                  <DateField
                    label="Until"
                    value={draft.endDate}
                    minimum={draft.startDate}
                    onChange={(endDate) => patch({ endDate })}
                  />
                </View>
              </View>
            ) : null}
          </View>

          {error ? (
            <Text
              role="alert"
              className="bg-warning-soft text-warning rounded-2xl px-4 py-3 text-xs">
              {error}
            </Text>
          ) : null}
        </BottomSheetScrollView>

        <View
          className="border-border/70 gap-2.5 border-t px-6 pt-3"
          style={{ paddingBottom: sheetBottom }}>
          <Text
            className={cn(
              'text-center text-[11px]',
              missing.length ? 'text-destructive' : 'text-muted-foreground'
            )}>
            {missing.length
              ? `Still needed: ${missing.join(', ')}`
              : 'Alerts arrive in NairaClinic and on WhatsApp.'}
          </Text>
          <View className="flex-row gap-2.5">
            <Button variant="ghost" className="flex-1 rounded-full" onPress={onClose}>
              <Text>Cancel</Text>
            </Button>
            <Button
              variant="default"
              className="flex-[1.6] rounded-full"
              disabled={missing.length > 0}
              onPress={save}>
              <Text>Save reminder</Text>
            </Button>
          </View>
        </View>
      </View>
    </BottomSheet>
  );
}
