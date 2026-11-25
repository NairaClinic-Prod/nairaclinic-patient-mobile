import { ActionButton } from '@/components/shared/action-button';
import { Sheet } from '@/components/shared/sheet';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Droplet, Gauge, Pencil, Plus, Trash2 } from 'lucide-react-native';
import { Alert, View } from 'react-native';
import { TIMING_LABEL } from '../constants';
import { deleteReading } from '../hooks/use-vitals';
import type { Reading, VitalView } from '../types';
import { stampLabel, toUnit } from '../utils';

type ReadingsListSheetProps = {
  open: boolean;
  kind: VitalView;
  readings: Reading[];
  onClose: () => void;
  onAdd: () => void;
  onEdit: (reading: Reading) => void;
};

function confirmDelete(reading: Reading) {
  Alert.alert(
    'Delete this reading?',
    `The reading from ${stampLabel(reading.atUtc)} will be removed.`,
    [
      { text: 'Keep it', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () =>
          deleteReading(reading.id).catch((error) =>
            Alert.alert(
              "Couldn't delete it",
              error instanceof Error ? error.message : 'Please try again.'
            )
          ),
      },
    ]
  );
}

export function ReadingsListSheet({
  open,
  kind,
  readings,
  onClose,
  onAdd,
  onEdit,
}: ReadingsListSheetProps) {
  const list = readings.filter((reading) => reading.kind === kind);

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={`${kind === 'bp' ? 'Blood pressure & pulse' : 'Blood sugar'} readings`}
      subtitle="Your readings stay separate from consultation notes. Times are shown in your own time zone.">
      <View className="flex-row items-center justify-between">
        <Text className="text-xs text-muted-foreground">
          {`${list.length} ${list.length === 1 ? 'reading' : 'readings'}`}
        </Text>
        <ActionButton label="Add reading" icon={Plus} onPress={onAdd} />
      </View>
      <View className="overflow-hidden rounded-3xl bg-muted">
        {list.map((reading, index) => (
          <View
            key={reading.id}
            className={`flex-row items-start gap-3 border-border/70 p-3.5 ${index ? 'border-t' : ''}`}>
            <View className="size-9 items-center justify-center rounded-full bg-card">
              <Icon
                as={reading.kind === 'bp' ? Gauge : Droplet}
                className="size-4.5 text-primary"
              />
            </View>
            <View className="min-w-0 flex-1 gap-0.5">
              <Text className="text-sm font-bold">
                {reading.kind === 'bp'
                  ? `${reading.systolic}/${reading.diastolic} mmHg${reading.pulse ? ` · ${reading.pulse} bpm` : ''}`
                  : `${toUnit(reading.sugar, 'mg/dL')} mg/dL · ${TIMING_LABEL[reading.timing]}`}
              </Text>
              <Text className="text-[11px] text-muted-foreground">{stampLabel(reading.atUtc)}</Text>
              {reading.note ? (
                <Text className="text-xs leading-4.5 text-muted-foreground">{reading.note}</Text>
              ) : null}
            </View>
            <ActionButton
              icon={Pencil}
              variant="outline"
              accessibilityLabel="Edit reading"
              onPress={() => onEdit(reading)}
            />
            <ActionButton
              icon={Trash2}
              variant="danger"
              accessibilityLabel="Delete reading"
              onPress={() => confirmDelete(reading)}
            />
          </View>
        ))}
        {list.length ? null : (
          <Text className="p-6 text-center text-xs text-muted-foreground">No readings yet.</Text>
        )}
      </View>
    </Sheet>
  );
}
