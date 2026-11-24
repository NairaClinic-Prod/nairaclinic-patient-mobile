import { Text } from '@/components/ui/text';
import { useColor } from '@/hooks/use-color';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Platform, Pressable } from 'react-native';
import { useUniwind } from 'uniwind';
import { isDateKey, isTime, longDateLabel } from '../utils';

const pad = (value: number) => String(value).padStart(2, '0');

function timeToDate(value: string) {
  const [hours, minutes] = isTime(value) ? value.split(':').map(Number) : [8, 0];
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function dateToTime(date: Date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function keyToDate(value: string) {
  if (!isDateKey(value)) return new Date();
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day, 12);
}

function dateToKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

type TimeFieldProps = {
  value: string;
  label: string;
  onChange: (value: string) => void;
};

export function TimeField({ value, label, onChange }: TimeFieldProps) {
  const color = useColor();
  const { theme } = useUniwind();
  const date = timeToDate(value);

  if (Platform.OS === 'android') {
    return (
      <Pressable
        role="button"
        accessibilityLabel={label}
        onPress={() =>
          DateTimePickerAndroid.open({
            value: date,
            mode: 'time',
            is24Hour: true,
            onChange: (event, picked) => {
              if (event.type === 'set' && picked) onChange(dateToTime(picked));
            },
          })
        }
        className="active:opacity-60">
        <Text className="text-2xl font-extrabold">{isTime(value) ? value : '--:--'}</Text>
      </Pressable>
    );
  }

  return (
    <DateTimePicker
      accessibilityLabel={label}
      value={date}
      mode="time"
      display="compact"
      accentColor={color.primary}
      themeVariant={theme === 'dark' ? 'dark' : 'light'}
      onChange={(_event, picked) => {
        if (picked) onChange(dateToTime(picked));
      }}
      style={{ alignSelf: 'flex-start', marginLeft: -10 }}
    />
  );
}

type DateFieldProps = {
  value: string;
  label: string;
  minimum?: string;
  onChange: (value: string) => void;
};

export function DateField({ value, label, minimum, onChange }: DateFieldProps) {
  const color = useColor();
  const { theme } = useUniwind();
  const date = keyToDate(value);
  const minimumDate = minimum && isDateKey(minimum) ? keyToDate(minimum) : undefined;

  if (Platform.OS === 'android') {
    return (
      <Pressable
        role="button"
        accessibilityLabel={label}
        onPress={() =>
          DateTimePickerAndroid.open({
            value: date,
            mode: 'date',
            minimumDate,
            onChange: (event, picked) => {
              if (event.type === 'set' && picked) onChange(dateToKey(picked));
            },
          })
        }
        className="active:opacity-60">
        <Text className="text-[13px] font-bold">
          {isDateKey(value) ? longDateLabel(value) : 'Choose date'}
        </Text>
      </Pressable>
    );
  }

  return (
    <DateTimePicker
      accessibilityLabel={label}
      value={date}
      mode="date"
      display="compact"
      minimumDate={minimumDate}
      accentColor={color.primary}
      themeVariant={theme === 'dark' ? 'dark' : 'light'}
      onChange={(_event, picked) => {
        if (picked) onChange(dateToKey(picked));
      }}
      style={{ alignSelf: 'flex-start', marginLeft: -10 }}
    />
  );
}
