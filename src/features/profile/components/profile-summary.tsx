import { ActionButton } from '@/components/shared/action-button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { Lock, Pencil } from 'lucide-react-native';
import { View } from 'react-native';

export function CompletionCard({
  percent,
  missing,
  onComplete,
}: {
  percent: number;
  missing: string[];
  onComplete: () => void;
}) {
  return (
    <View className="bg-card gap-3 rounded-3xl p-4">
      <View className="flex-row items-baseline justify-between">
        <Text className="text-[15px] font-extrabold">{`Profile ${percent}% complete`}</Text>
        <Text className="text-muted-foreground text-xs">{`${missing.length} to add`}</Text>
      </View>
      <View className="bg-muted h-2 overflow-hidden rounded-full">
        <View className="bg-primary h-2 rounded-full" style={{ width: `${percent}%` }} />
      </View>
      <Text className="text-muted-foreground text-xs leading-4.5">
        {`Add ${missing.slice(0, 3).join(', ').toLowerCase()}${missing.length > 3 ? ' and more' : ''} so clinicians have what they need.`}
      </Text>
      <ActionButton size="md" variant="outline" label="Complete my profile" onPress={onComplete} />
    </View>
  );
}

export type Detail = { label: string; value: string; locked?: boolean };

export function DetailsCard({
  title,
  details,
  onEdit,
  editLabel = 'Edit',
}: {
  title: string;
  details: Detail[];
  onEdit: () => void;
  editLabel?: string;
}) {
  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        <Text className="text-lg font-extrabold">{title}</Text>
        <ActionButton label={editLabel} icon={Pencil} variant="ghost" onPress={onEdit} />
      </View>
      <View className="bg-card overflow-hidden rounded-3xl">
        {details.map((detail, index) => (
          <View
            key={detail.label}
            className={cn('gap-0.5 px-4 py-3', index > 0 && 'border-border border-t')}>
            <View className="flex-row items-center gap-1.5">
              <Text className="text-muted-foreground text-xs">{detail.label}</Text>
              {detail.locked ? <Icon as={Lock} className="text-muted-foreground size-3" /> : null}
            </View>
            <Text
              className={cn(
                'text-[14px] leading-5 font-semibold',
                !detail.value && 'text-muted-foreground font-normal'
              )}>
              {detail.value || 'Not added yet'}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
