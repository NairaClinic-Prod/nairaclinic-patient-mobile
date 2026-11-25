import { ActionButton } from '@/components/shared/action-button';
import { Text } from '@/components/ui/text';
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
