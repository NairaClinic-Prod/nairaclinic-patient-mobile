import { PressableScale } from '@/components/shared/pressable-scale';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react-native';
import type * as React from 'react';
import { View } from 'react-native';

type StepCardProps = {
  number: number;
  title: string;
  summary?: string;
  done: boolean;
  expanded: boolean;
  onEdit?: () => void;
  children: React.ReactNode;
};

// One step of the booking. Once it is answered it folds down to a line, with Edit to open it again.
export function StepCard({
  number,
  title,
  summary,
  done,
  expanded,
  onEdit,
  children,
}: StepCardProps) {
  return (
    <View className="gap-4 rounded-2xl bg-card p-4">
      <View className="flex-row items-center gap-3">
        <View
          className={cn(
            'size-7 items-center justify-center rounded-full',
            done ? 'bg-primary' : 'bg-secondary'
          )}>
          {done ? (
            <Icon as={Check} strokeWidth={3} className="size-4 text-primary-foreground" />
          ) : (
            <Text className="text-[13px] font-bold text-primary">{number}</Text>
          )}
        </View>
        <View className="min-w-0 flex-1">
          <Text className="text-[15px] font-bold">{title}</Text>
          {done && !expanded && summary ? (
            <Text className="text-[13px] text-muted-foreground" numberOfLines={1}>
              {summary}
            </Text>
          ) : null}
        </View>
        {done && !expanded && onEdit ? (
          <PressableScale scaleTo={0.94} role="button" onPress={onEdit} className="px-2 py-1">
            <Text className="text-[13px] font-semibold text-primary">Edit</Text>
          </PressableScale>
        ) : null}
      </View>
      {expanded ? children : null}
    </View>
  );
}
