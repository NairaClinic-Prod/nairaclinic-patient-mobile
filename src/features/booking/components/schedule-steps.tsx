import { Text } from '@/components/ui/text';
import * as React from 'react';
import { ActivityIndicator } from 'react-native';
import type { DayOfSlots } from '../types';
import { longDay, timeRange } from '../utils';
import { DayPicker } from './day-picker';
import { StepCard } from './step-card';
import { TimePicker } from './time-picker';

type ScheduleStepsProps = {
  days: DayOfSlots[];
  durationMins?: number;
  caption?: string;
  timeLoading?: boolean;
  dayKey: string | null;
  slotId: string | null;
  firstNumber: number;
  onDay: (key: string) => void;
  onSlot: (id: string) => void;
};

// The date step, then the time step once a date is chosen. Each folds to a line when answered.
export function ScheduleSteps({
  days,
  durationMins,
  caption,
  timeLoading,
  dayKey,
  slotId,
  firstNumber,
  onDay,
  onSlot,
}: ScheduleStepsProps) {
  const [edit, setEdit] = React.useState<'date' | 'time' | null>(null);
  const day = days.find((item) => item.key === dayKey);
  const slot = day?.slots.find((item) => item.id === slotId);
  const nextId = days[0]?.slots[0]?.id;

  return (
    <>
      <StepCard
        number={firstNumber}
        title="Select a date"
        summary={day ? longDay(day.date) : undefined}
        done={Boolean(day)}
        reveal={firstNumber > 1}
        expanded={!day || edit === 'date'}
        onEdit={() => setEdit('date')}>
        {days.length ? (
          <DayPicker
            days={days}
            selected={dayKey}
            onChange={(key) => {
              setEdit(null);
              onDay(key);
            }}
          />
        ) : (
          <Text className="text-[13px] leading-5 text-muted-foreground">
            No available times found. Check back soon.
          </Text>
        )}
      </StepCard>

      {day ? (
        <StepCard
          number={firstNumber + 1}
          title="Select a time"
          summary={slot ? timeRange(slot) : undefined}
          done={Boolean(slot)}
          expanded={!slot || edit === 'time'}
          onEdit={() => setEdit('time')}>
          {timeLoading ? (
            <ActivityIndicator />
          ) : (
            <TimePicker
              slots={day.slots}
              durationMins={durationMins}
              caption={caption}
              selected={slotId}
              nextId={nextId}
              onChange={(id) => {
                setEdit(null);
                onSlot(id);
              }}
            />
          )}
        </StepCard>
      ) : null}
    </>
  );
}
