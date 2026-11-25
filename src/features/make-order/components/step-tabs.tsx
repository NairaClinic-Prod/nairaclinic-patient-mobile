import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { View } from 'react-native';

// One quiet line and a thin bar, instead of three boxes.
export function StepTabs({ labels, step }: { labels: string[]; step: number }) {
  return (
    <View
      className="gap-2"
      accessibilityLabel={`Step ${step} of ${labels.length}: ${labels[step - 1]}`}>
      <View className="flex-row gap-1.5">
        {labels.map((label, index) => (
          <View
            key={label}
            className={cn('h-1 flex-1 rounded-full', index < step ? 'bg-primary' : 'bg-muted')}
          />
        ))}
      </View>
      <Text className="text-muted-foreground text-xs">
        {`Step ${step} of ${labels.length} · `}
        <Text className="text-foreground text-xs font-semibold">{labels[step - 1]}</Text>
      </Text>
    </View>
  );
}
