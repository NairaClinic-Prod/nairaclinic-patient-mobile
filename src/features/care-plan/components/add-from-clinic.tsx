import { ActionButton } from '@/components/patterns/action-button';
import { ChoiceSheet } from '@/components/patterns/choice-sheet';
import { FlaskConical, Pill, Plus } from 'lucide-react-native';
import * as React from 'react';

export type ClinicRecordKind = 'test' | 'medication';

type AddFromClinicProps = {
  size?: 'sm' | 'md';
  className?: string;
  textClassName?: string;
  onPick?: (kind: ClinicRecordKind) => void;
};

type AddFromClinicSheetProps = {
  open: boolean;
  onClose: () => void;
  onPick?: (kind: ClinicRecordKind) => void;
};

export function AddFromClinicSheet({ open, onClose, onPick }: AddFromClinicSheetProps) {
  return (
    <ChoiceSheet<ClinicRecordKind>
      open={open}
      onClose={onClose}
      title="Add from another clinic"
      subtitle="Keep records from outside NairaClinic in one place."
      choices={[
        {
          key: 'test',
          title: 'Lab test / procedure request',
          description: 'Add lab tests or procedures requested outside NairaClinic.',
          icon: FlaskConical,
        },
        {
          key: 'medication',
          title: 'Prescription · Medicines',
          description: 'Add medicines prescribed outside NairaClinic.',
          icon: Pill,
        },
      ]}
      onPick={(kind) => onPick?.(kind)}
    />
  );
}

export function AddFromClinic({
  size = 'md',
  className,
  textClassName,
  onPick,
}: AddFromClinicProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <ActionButton
        label="Add from another clinic"
        icon={Plus}
        variant="outline"
        size={size}
        className={className}
        textClassName={textClassName}
        onPress={() => setOpen(true)}
      />
      <AddFromClinicSheet open={open} onClose={() => setOpen(false)} onPick={onPick} />
    </>
  );
}
