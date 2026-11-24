import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react-native';
import { View } from 'react-native';

export function StepTabs({ labels, step }: { labels: string[]; step: number }) {
  return (
    <View accessibilityLabel="Progress" className="flex-row gap-2">
      {labels.map((label, index) => {
        const n = index + 1;
        const active = n === step;
        const done = n < step;
        return (
          <View
            key={label}
            accessibilityState={{ selected: active }}
            className={cn(
              'min-w-0 flex-1 items-center gap-1.5 rounded-xl border px-1.5 py-2.5',
              active ? 'border-primary/40 bg-secondary' : 'border-border bg-secondary/20'
            )}>
            <View
              className={cn(
                'size-6 items-center justify-center rounded-full',
                done || active ? 'bg-primary/15' : 'bg-muted'
              )}>
              {done ? (
                <Icon as={Check} className="text-primary size-3.5" />
              ) : (
                <Text
                  className={cn(
                    'text-xs font-bold',
                    active ? 'text-primary' : 'text-muted-foreground'
                  )}>
                  {n}
                </Text>
              )}
            </View>
            <Text
              numberOfLines={1}
              className={cn(
                'text-[11px] leading-4',
                active ? 'font-semibold' : 'text-muted-foreground'
              )}>
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
