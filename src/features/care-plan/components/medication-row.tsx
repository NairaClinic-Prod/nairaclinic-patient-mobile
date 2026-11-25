import { openMakeOrder } from '@/features/make-order/store';
import { ActionButton } from '@/components/shared/action-button';
import { StatusPill } from '@/components/shared/status-pill';
import { Text } from '@/components/ui/text';
import { BellPlus, PackageCheck, Pill, ShoppingBag } from 'lucide-react-native';
import type * as React from 'react';
import { View } from 'react-native';
import { DEFAULT_MED_NOTE, OWNED_NOTE } from '../constants';
import { askOwned } from '../store';
import type { CareMedication } from '../types';
import { courseEnded, daysRemaining, formatDate, isOrderable, plural } from '../utils';
import { FactGrid, RecordNote, RecordRow, RecordTag } from './record-row';

export type MedicationHandlers = {
  onOrder?: (meds: CareMedication[]) => void;
  onRemind?: (med: CareMedication) => void;
};

type MedicationRowProps = {
  med: CareMedication;
  handlers?: MedicationHandlers;
  compact?: boolean;
  extra?: React.ReactNode;
};

function Chips({ med }: { med: CareMedication }) {
  const left = daysRemaining(med);
  const ended = courseEnded(med);
  return (
    <View className="flex-row flex-wrap gap-1.5">
      {med.state === 'owned' ? <StatusPill tone="active">You have this medicine</StatusPill> : null}
      {med.state === 'ordered' ? <StatusPill tone="active">Ordered</StatusPill> : null}
      {med.state === 'available' && !ended ? (
        <StatusPill tone="info">Ready to order</StatusPill>
      ) : null}
      {ended ? (
        <StatusPill tone="inactive">Course ended</StatusPill>
      ) : left !== null ? (
        <StatusPill tone="inactive">{`${plural(left, 'day')} remaining`}</StatusPill>
      ) : null}
    </View>
  );
}

export function MedicationRow({ med, handlers, compact = false, extra }: MedicationRowProps) {
  const instruction = med.instruction.trim() || DEFAULT_MED_NOTE;
  const note = compact || med.state === 'available' ? instruction : OWNED_NOTE;
  const ended = courseEnded(med);

  const actions =
    med.state !== 'available' ? (
      <ActionButton
        label="Set reminder"
        icon={BellPlus}
        onPress={() => handlers?.onRemind?.(med)}
      />
    ) : ended ? null : (
      <>
        {isOrderable(med) ? (
          <ActionButton
            label="Order"
            icon={ShoppingBag}
            onPress={() =>
              handlers?.onOrder
                ? handlers.onOrder([med])
                : openMakeOrder({
                    kind: 'medication',
                    sourceId: med.encounterId,
                    names: [[med.name, med.strength].filter(Boolean).join(' ')],
                  })
            }
          />
        ) : null}
        <ActionButton
          label="I have this medicine"
          icon={PackageCheck}
          variant="outline"
          onPress={() => askOwned(med)}
        />
      </>
    );

  return (
    <RecordRow
      // icon={Pill}
      actions={actions}
      trailing={extra}>
      <View className="gap-1">
        <RecordTag>{`Rx #${med.rx}`}</RecordTag>
        <Text className="text-base leading-5.5 font-bold">
          {med.name}
          {med.strength ? (
            <Text className="text-base font-normal text-muted-foreground">{` ${med.strength}`}</Text>
          ) : null}
        </Text>
      </View>
      {compact ? null : <Chips med={med} />}
      {compact ? null : (
        <FactGrid
          facts={[
            { label: 'Dose', value: med.dose },
            { label: 'Frequency', value: med.frequency },
            {
              label: 'Duration',
              value: med.durationDays ? plural(med.durationDays, 'day') : 'As prescribed',
            },
            { label: 'Route', value: med.route },
            { label: 'Starts', value: formatDate(med.startIso) },
            { label: 'Ends', value: med.endIso ? formatDate(med.endIso) : '—' },
          ]}
        />
      )}
      <RecordNote>{note}</RecordNote>
    </RecordRow>
  );
}
