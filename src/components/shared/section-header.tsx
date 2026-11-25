import { Text } from '@/components/ui/text';
import { SCREEN_PADDING_X } from '@/constants/ui';
import { cn } from '@/lib/utils';
import { Pressable, View } from 'react-native';

type SectionHeaderProps = {
  title: string;
  action?: string;
  onActionPress?: () => void;
  className?: string;
};

export function SectionHeader({ title, action, onActionPress, className }: SectionHeaderProps) {
  return (
    <View
      className={cn('flex-row items-center justify-between', className)}
      style={{ paddingHorizontal: SCREEN_PADDING_X }}>
      <Text className="text-base font-bold">{title}</Text>
      {action ? (
        <Pressable hitSlop={12} onPress={onActionPress} className="active:opacity-60">
          <Text className="text-xs font-medium text-muted-foreground">{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
