import { ActionButton } from '@/components/patterns/action-button';
import { ChoiceChips } from '@/components/patterns/choice-chips';
import { SegmentedControl } from '@/components/patterns/segmented-control';
import { ReadOnlyField } from '@/components/patterns/read-only-field';
import { Sheet } from '@/components/patterns/sheet';
import { TextField } from '@/components/patterns/text-field';
import { Text } from '@/components/ui/text';
import * as Haptics from 'expo-haptics';
import * as React from 'react';
import { View } from 'react-native';
import { TIMING_LABEL } from '../constants';
import { saveReading } from '../hooks/use-vitals';
import type { Reading, SugarTiming, SugarUnit, VitalView } from '../types';
import { dateOnlyLabel, fromUnit, newReadingId, timeOnlyLabel, toUnit } from '../utils';

const FIXED_HINT = "Read-only. It's recorded automatically when you save, so it can't be edited.";

type ReadingSheetProps = {
  open: boolean;
  editing: Reading | null;
  defaultKind: VitalView;
  onClose: () => void;
};

type Form = {
  kind: VitalView;
  systolic: string;
  diastolic: string;
  pulse: string;
  sugar: string;
  unit: SugarUnit;
  timing: SugarTiming;
  note: string;
};

const digits = (value: string, decimals = false) =>
  decimals ? value.replace(/[^\d.]/g, '').slice(0, 5) : value.replace(/\D/g, '').slice(0, 3);

function initialForm(editing: Reading | null, kind: VitalView): Form {
  const form: Form = {
    kind: editing?.kind ?? kind,
    systolic: '',
    diastolic: '',
    pulse: '',
    sugar: '',
    unit: 'mg/dL',
    timing: 'random',
    note: editing?.note ?? '',
  };
  if (editing?.kind === 'bp') {
    form.systolic = String(editing.systolic);
    form.diastolic = String(editing.diastolic);
    form.pulse = editing.pulse ? String(editing.pulse) : '';
  }
  if (editing?.kind === 'sugar') {
    form.sugar = String(toUnit(editing.sugar, 'mg/dL'));
    form.timing = editing.timing;
  }
  return form;
}

function missingFor(form: Form) {
  if (form.kind === 'bp') {
    const systolic = Number(form.systolic);
    const diastolic = Number(form.diastolic);
    const pulse = Number(form.pulse);
    return [
      ...(systolic >= 50 && systolic <= 300 ? [] : ['Systolic between 50 and 300']),
      ...(diastolic >= 30 && diastolic <= 200 ? [] : ['Diastolic between 30 and 200']),
      ...(!form.pulse || (pulse >= 20 && pulse <= 250) ? [] : ['A pulse between 20 and 250']),
    ];
  }
  return Number(form.sugar) > 0 ? [] : ['Your blood sugar'];
}

export function ReadingSheet({ open, editing, defaultKind, onClose }: ReadingSheetProps) {
  const [form, setForm] = React.useState(() => initialForm(editing, defaultKind));
  const [openedAt, setOpenedAt] = React.useState(() => new Date().toISOString());

  React.useEffect(() => {
    if (open) {
      setForm(initialForm(editing, defaultKind));
      setOpenedAt(new Date().toISOString());
    }
  }, [open, editing, defaultKind]);

  const patch = (change: Partial<Form>) => setForm((current) => ({ ...current, ...change }));
  const missing = missingFor(form);
  const taken = editing?.atUtc ?? openedAt;

  function changeUnit(unit: SugarUnit) {
    const value = Number(form.sugar);
    patch({
      unit,
      sugar: value > 0 ? String(toUnit(fromUnit(value, form.unit), unit)) : form.sugar,
    });
  }

  function save() {
    const common = {
      id: editing?.id ?? newReadingId(),
      atUtc: editing ? editing.atUtc : new Date().toISOString(),
      note: form.note.trim() || undefined,
    };
    saveReading(
      form.kind === 'bp'
        ? {
            ...common,
            kind: 'bp',
            systolic: Number(form.systolic),
            diastolic: Number(form.diastolic),
            pulse: form.pulse ? Number(form.pulse) : null,
          }
        : {
            ...common,
            kind: 'sugar',
            sugar: fromUnit(Number(form.sugar), form.unit),
            timing: form.timing,
          }
    );
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onClose();
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={editing ? 'Edit reading' : 'Add a reading'}
      subtitle="Your readings stay separate from consultation notes."
      snapPoints={['86%']}
      footer={
        <View className="gap-2">
          {missing.length ? (
            <Text className="text-muted-foreground text-xs">{`Still needed: ${missing.join(', ')}.`}</Text>
          ) : null}
          <View className="flex-row gap-2">
            <ActionButton
              size="md"
              label="Cancel"
              variant="outline"
              className="flex-1"
              onPress={onClose}
            />
            <ActionButton
              size="md"
              label={editing ? 'Save changes' : 'Save reading'}
              className="flex-[2]"
              disabled={missing.length > 0}
              onPress={save}
            />
          </View>
        </View>
      }>
      {editing ? null : (
        <SegmentedControl
          value={form.kind}
          onChange={(kind) => patch({ kind })}
          options={[
            { value: 'bp', label: 'Blood pressure' },
            { value: 'sugar', label: 'Blood sugar' },
          ]}
        />
      )}

      {form.kind === 'bp' ? (
        <View className="gap-3.5">
          <View className="flex-row gap-3">
            <View className="flex-1">
              <TextField
                sheet
                tone="muted"
                label="Systolic"
                required
                keyboardType="number-pad"
                placeholder="e.g. 122"
                value={form.systolic}
                onChangeText={(value) => patch({ systolic: digits(value) })}
              />
            </View>
            <View className="flex-1">
              <TextField
                sheet
                tone="muted"
                label="Diastolic"
                required
                keyboardType="number-pad"
                placeholder="e.g. 80"
                value={form.diastolic}
                onChangeText={(value) => patch({ diastolic: digits(value) })}
              />
            </View>
          </View>
          <TextField
            sheet
            tone="muted"
            label="Pulse · optional"
            keyboardType="number-pad"
            placeholder="e.g. 77"
            value={form.pulse}
            onChangeText={(value) => patch({ pulse: digits(value) })}
          />
        </View>
      ) : (
        <View className="gap-3.5">
          <SegmentedControl
            value={form.unit}
            onChange={changeUnit}
            options={[
              { value: 'mg/dL', label: 'mg/dL' },
              { value: 'mmol/L', label: 'mmol/L' },
            ]}
          />
          <TextField
            sheet
            tone="muted"
            label="Blood sugar"
            required
            keyboardType="decimal-pad"
            placeholder={form.unit === 'mg/dL' ? 'e.g. 96' : 'e.g. 5.3'}
            value={form.sugar}
            onChangeText={(value) => patch({ sugar: digits(value, true) })}
          />
          <ChoiceChips
            label="When was it taken?"
            scroll
            options={Object.values(TIMING_LABEL)}
            value={TIMING_LABEL[form.timing]}
            onChange={(label) => {
              const entry = (Object.entries(TIMING_LABEL) as [SugarTiming, string][]).find(
                ([, text]) => text === label
              );
              if (entry) patch({ timing: entry[0] });
            }}
          />
        </View>
      )}

      <View className="flex-row gap-2.5" style={{ zIndex: 2 }}>
        <ReadOnlyField label="Date" value={dateOnlyLabel(taken)} hint={FIXED_HINT} />
        <ReadOnlyField label="Time" value={timeOnlyLabel(taken)} hint={FIXED_HINT} />
      </View>

      <TextField
        sheet
        tone="muted"
        label="Note · optional"
        multiline
        maxLength={200}
        placeholder="Anything you'd like to remember"
        value={form.note}
        onChangeText={(note) => patch({ note })}
      />
    </Sheet>
  );
}
