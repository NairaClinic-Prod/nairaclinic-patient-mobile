import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { ChevronRight, type LucideIcon } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

export type MenuItem = {
  key: string;
  title: string;
  text: string;
  icon: LucideIcon;
  danger?: boolean;
  onPress: () => void;
};

export function MenuList({ items }: { items: MenuItem[] }) {
  return (
    <View className="bg-card overflow-hidden rounded-3xl">
      {items.map((item, index) => (
        <Pressable
          key={item.key}
          role="button"
          onPress={item.onPress}
          className={cn(
            'border-border h-[68px] flex-row items-center gap-3.5 px-4 active:opacity-70',
            index < items.length - 1 ? 'border-b' : ''
          )}>
          <Icon
            as={item.icon}
            className={cn('size-5', item.danger ? 'text-destructive' : 'text-foreground')}
          />
          <View className="flex-1 gap-0.5">
            <Text
              className={cn('text-[13px] font-bold', item.danger ? 'text-destructive' : undefined)}>
              {item.title}
            </Text>
            <Text className="text-muted-foreground text-[11px]" numberOfLines={1}>
              {item.text}
            </Text>
          </View>
          <Icon as={ChevronRight} className="text-muted-foreground size-4" />
        </Pressable>
      ))}
    </View>
  );
}
