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
    <View className="bg-muted overflow-hidden rounded-2xl">
      {options.map((option, index) => (
        <PressableScale
          key={option.key}
          scaleTo={0.99}
          role="button"
          onPress={() => onPick(option.key)}
          className={cn(
            'flex-row items-center gap-3 px-3.5 py-3',
            index > 0 && 'border-border/70 border-t'
          )}>
          <View className="bg-card size-9 items-center justify-center rounded-full">
            <Icon as={option.icon} className="text-primary size-4" />
          </View>
          <View className="min-w-0 flex-1">
            <Text className="text-[14px] leading-5 font-semibold">{option.title}</Text>
            <Text className="text-muted-foreground text-xs leading-4" numberOfLines={1}>
              {option.description}
            </Text>
          </View>
          <Icon as={ChevronRight} className="text-muted-foreground size-4" />
        </PressableScale>
      ))}
    </View>
  );
}
