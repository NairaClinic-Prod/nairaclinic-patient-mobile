import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { View } from 'react-native';

export type PillTone = 'active' | 'pending' | 'inactive' | 'info';

const TONE: Record<PillTone, { box: string; text: string }> = {
  active: { box: 'bg-secondary', text: 'text-success' },
  pending: { box: 'bg-warning-soft', text: 'text-warning' },
  inactive: { box: 'bg-muted', text: 'text-muted-foreground' },
  info: { box: 'bg-accent', text: 'text-accent-foreground' },
};

type StatusPillProps = { tone: PillTone; children: string; className?: string };

export function StatusPill({ tone, children, className }: StatusPillProps) {
  return (
    <View className={cn('self-start rounded-full px-2.5 py-1', TONE[tone].box, className)}>
      <Text className={cn('text-[11px] font-bold', TONE[tone].text)}>{children}</Text>
    </View>
  );
}
