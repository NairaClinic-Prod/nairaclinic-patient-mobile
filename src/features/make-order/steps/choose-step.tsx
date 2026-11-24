import { OptionList, type Option } from '@/components/shared/option-list';
import { FlaskConical, Pill } from 'lucide-react-native';
import type { OrderKind } from '../types';

const OPTIONS: Option<OrderKind>[] = [
  { key: 'lab', title: 'Lab test', description: 'Book tests or procedures', icon: FlaskConical },
  { key: 'medication', title: 'Medicines', description: 'Compare pharmacy prices', icon: Pill },
];

export function ChooseStep({ onChoose }: { onChoose: (kind: OrderKind) => void }) {
  return <OptionList options={OPTIONS} onPick={onChoose} />;
}
