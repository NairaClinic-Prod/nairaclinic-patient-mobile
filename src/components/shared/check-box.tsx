import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react-native';
import { View } from 'react-native';

export function CheckBox({ checked, disabled }: { checked: boolean; disabled?: boolean }) {
  return (
    <View
      className={cn(
        'size-6 items-center justify-center rounded-md border-2',
        checked ? 'border-primary bg-primary' : 'border-muted-foreground/40',
        disabled && 'opacity-50'
      )}>
      {checked ? (
        <Icon as={Check} strokeWidth={3} className="text-primary-foreground size-3.5" />
      ) : null}
    </View>
  );
}
