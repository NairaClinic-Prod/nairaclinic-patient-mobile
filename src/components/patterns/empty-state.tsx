import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import type { LucideIcon } from 'lucide-react-native';
import type * as React from 'react';
import { View } from 'react-native';

type EmptyStateProps = {
  icon: LucideIcon;
  title?: string;
  text: string;
  action?: React.ReactNode;
};

export function EmptyState({ icon, title, text, action }: EmptyStateProps) {
  return (
    <View className="items-center gap-2.5 px-6 py-8">
      <View className="bg-secondary size-10 items-center justify-center rounded-full">
        <Icon as={icon} className="text-primary size-4" />
      </View>
      {title ? <Text className="text-center text-[13px] font-bold">{title}</Text> : null}
      <Text className="text-muted-foreground text-center text-xs leading-[18px]">{text}</Text>
      {action}
    </View>
  );
}
