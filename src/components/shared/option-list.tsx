import { PressableScale } from '@/components/shared/pressable-scale';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { ChevronRight, type LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

export type Option<T extends string> = {
  key: T;
  title: string;
  description: string;
  icon: LucideIcon;
};

type OptionListProps<T extends string> = {
  options: Option<T>[];
  onPick: (key: T) => void;
};

// One quiet grouped list for short "pick one" choices: small icon, title, one line of hint, thin dividers.
export function OptionList<T extends string>({ options, onPick }: OptionListProps<T>) {
  return (
    <View className="overflow-hidden rounded-2xl bg-muted">
      {options.map((option, index) => (
        <PressableScale
          key={option.key}
          scaleTo={0.99}
          role="button"
          onPress={() => onPick(option.key)}
          className={cn(
            'flex-row items-center gap-3 px-3.5 py-3',
            index > 0 && 'border-t border-border/70'
          )}>
          <View className="size-9 items-center justify-center rounded-full bg-card">
            <Icon as={option.icon} className="size-4 text-primary" />
          </View>
          <View className="min-w-0 flex-1">
            <Text className="text-[14px] leading-5 font-semibold">{option.title}</Text>
            <Text className="text-xs leading-4 text-muted-foreground" numberOfLines={1}>
              {option.description}
            </Text>
          </View>
          <Icon as={ChevronRight} className="size-4 text-muted-foreground" />
        </PressableScale>
      ))}
    </View>
  );
}
