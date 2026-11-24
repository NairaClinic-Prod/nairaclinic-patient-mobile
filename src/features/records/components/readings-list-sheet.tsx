import { ActionButton } from '@/components/patterns/action-button';
import { Sheet } from '@/components/patterns/sheet';
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
      { text: 'Delete', style: 'destructive', onPress: () => deleteReading(reading.id) },
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
        <Text className="text-muted-foreground text-xs">
          {`${list.length} ${list.length === 1 ? 'reading' : 'readings'}`}
        </Text>
        <ActionButton label="Add reading" icon={Plus} onPress={onAdd} />
      </View>
      <View className="bg-muted overflow-hidden rounded-3xl">
        {list.map((reading, index) => (
          <View
            key={reading.id}
            className={`border-border/70 flex-row items-start gap-3 p-3.5 ${index ? 'border-t' : ''}`}>
            <View className="bg-card size-9 items-center justify-center rounded-full">
              <Icon
                as={reading.kind === 'bp' ? Gauge : Droplet}
                className="text-primary size-4.5"
              />
            </View>
            <View className="min-w-0 flex-1 gap-0.5">
              <Text className="text-sm font-bold">
                {reading.kind === 'bp'
                  ? `${reading.systolic}/${reading.diastolic} mmHg${reading.pulse ? ` · ${reading.pulse} bpm` : ''}`
                  : `${toUnit(reading.sugar, 'mg/dL')} mg/dL · ${TIMING_LABEL[reading.timing]}`}
              </Text>
              <Text className="text-muted-foreground text-[11px]">{stampLabel(reading.atUtc)}</Text>
              {reading.note ? (
                <Text className="text-muted-foreground text-xs leading-4.5">{reading.note}</Text>
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
          <Text className="text-muted-foreground p-6 text-center text-xs">No readings yet.</Text>
        )}
      </View>
    </Sheet>
  );
}
