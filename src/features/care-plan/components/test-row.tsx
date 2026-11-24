import { ActionButton } from '@/components/patterns/action-button';
import { StatusPill } from '@/components/patterns/status-pill';
import { Text } from '@/components/ui/text';
import { FileText, FlaskConical, ShoppingBag, Trash2, Upload } from 'lucide-react-native';
import type * as React from 'react';
import { View } from 'react-native';
import { TEST_NOTE } from '../constants';
import type { CareTest } from '../types';
import { formatDateTime } from '../utils';
import { FactGrid, RecordNote, RecordRow, RecordTag } from './record-row';

export type TestHandlers = {
  onOrder?: (test: CareTest) => void;
  onUpload?: (test: CareTest) => void;
  onViewResult?: (test: CareTest) => void;
  onDeleteResult?: (test: CareTest) => void;
};

type TestRowProps = {
  test: CareTest;
  handlers?: TestHandlers;
  compact?: boolean;
  extra?: React.ReactNode;
};

export function TestRow({ test, handlers, compact = false, extra }: TestRowProps) {
  const resulted = test.status === 'resulted';
  const note = resulted
    ? 'Your uploaded report is available to view or download.'
    : test.note || TEST_NOTE;

  return (
    <RecordRow
      // icon={FlaskConical}
      actions={
        <>
          {resulted ? (
            <ActionButton
              label="View result"
              icon={FileText}
              onPress={() => handlers?.onViewResult?.(test)}
            />
          ) : (
            <>
              <ActionButton label="Order" icon={ShoppingBag} onPress={() => handlers?.onOrder?.(test)} />
              <ActionButton
                label="Upload result"
                icon={Upload}
                variant="ghost"
                onPress={() => handlers?.onUpload?.(test)}
              />
            </>
          )}
          {extra}
          {resulted ? (
            <ActionButton
              label="Delete"
              icon={Trash2}
              variant="danger"
              onPress={() => handlers?.onDeleteResult?.(test)}
            />
          ) : null}
        </>
      }>
      <View className="gap-1">
        <RecordTag>{`Test #${test.n}`}</RecordTag>
        <Text className="text-base font-bold leading-[22px]">{test.name}</Text>
      </View>
      {compact ? null : resulted ? (
        <StatusPill tone="active">Result available</StatusPill>
      ) : (
        <StatusPill tone="pending">Awaiting result</StatusPill>
      )}
      {compact ? null : (
        <FactGrid
          facts={[
            { label: 'Sample', value: test.sample },
            { label: 'Requested', value: formatDateTime(test.requestedIso) },
          ]}
        />
      )}
      <RecordNote>{note}</RecordNote>
    </RecordRow>
  );
}
