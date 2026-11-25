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
    <View className="gap-3 rounded-3xl bg-card p-4">
      <View className="flex-row items-baseline justify-between">
        <Text className="text-[15px] font-extrabold">{`Profile ${percent}% complete`}</Text>
        <Text className="text-xs text-muted-foreground">{`${missing.length} to add`}</Text>
      </View>
      <View className="h-2 overflow-hidden rounded-full bg-muted">
        <View className="h-2 rounded-full bg-primary" style={{ width: `${percent}%` }} />
      </View>
      <Text className="text-xs leading-4.5 text-muted-foreground">
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
      <View className="overflow-hidden rounded-3xl bg-card">
        {details.map((detail, index) => (
          <View
            key={detail.label}
            className={cn('gap-0.5 px-4 py-3', index > 0 && 'border-t border-border')}>
            <View className="flex-row items-center gap-1.5">
              <Text className="text-xs text-muted-foreground">{detail.label}</Text>
              {detail.locked ? <Icon as={Lock} className="size-3 text-muted-foreground" /> : null}
            </View>
            <Text
              className={cn(
                'text-[14px] leading-5 font-semibold',
                !detail.value && 'font-normal text-muted-foreground'
              )}>
              {detail.value || 'Not added yet'}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
