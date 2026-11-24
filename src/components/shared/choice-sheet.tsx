import { OptionList, type Option } from '@/components/shared/option-list';
import { Sheet } from '@/components/shared/sheet';

export type Choice<T extends string> = Option<T>;

type ChoiceSheetProps<T extends string> = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  choices: Choice<T>[];
  onPick: (key: T) => void;
};

export function ChoiceSheet<T extends string>({
  open,
  onClose,
  title,
  subtitle,
  choices,
  onPick,
}: ChoiceSheetProps<T>) {
  return (
    <Sheet open={open} onClose={onClose} title={title} subtitle={subtitle}>
      <OptionList
        options={choices}
        onPick={(key) => {
          onClose();
          onPick(key);
        }}
      />
    </Sheet>
  );
}
