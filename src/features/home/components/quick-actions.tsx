import { PressableScale } from '@/components/shared/pressable-scale';
import { HScroll } from '@/components/shared/h-scroll';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { FileHeart, Pill, Stethoscope, type LucideIcon } from 'lucide-react-native';

type Action = { label: string; icon: LucideIcon; primary?: boolean; onPress?: () => void };

type QuickActionsProps = {
  onBook?: () => void;
  onRecords?: () => void;
  onOrder?: () => void;
};

export function QuickActions({ onBook, onRecords, onOrder }: QuickActionsProps) {
  const actions: Action[] = [
    { label: 'Book a consultation', icon: Stethoscope, primary: true, onPress: onBook },
    { label: 'Medical records', icon: FileHeart, onPress: onRecords },
    { label: 'Make an order', icon: Pill, onPress: onOrder },
  ];

  return (
    <HScroll>
      {actions.map(({ label, icon, primary, onPress }) => (
        <PressableScale
          scaleTo={0.96}
          key={label}
          role="button"
          onPress={onPress}
          className={cn(
            'flex-row items-center gap-2 rounded-full px-4 py-2.5',
            primary ? 'bg-primary' : 'bg-card'
          )}>
          <Icon
            as={icon}
            className={cn('size-4', primary ? 'text-primary-foreground' : 'text-primary')}
          />
          <Text
            className={cn(
              'text-[13px] font-bold',
              primary ? 'text-primary-foreground' : undefined
            )}>
            {label}
          </Text>
        </PressableScale>
      ))}
    </HScroll>
  );
}
