import { ActionButton } from '@/components/shared/action-button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { router } from 'expo-router';
import { Check } from 'lucide-react-native';
import { View } from 'react-native';

type BookingSuccessProps = {
  title: string;
  text: string;
  rows: [string, string][];
};

export function BookingSuccess({ title, text, rows }: BookingSuccessProps) {
  return (
    <View className="items-center gap-6 pt-6">
      <View className="size-16 items-center justify-center rounded-full bg-primary">
        <Icon as={Check} strokeWidth={3} className="size-8 text-primary-foreground" />
      </View>
      <View className="items-center gap-1.5 px-4">
        <Text className="text-center text-2xl font-extrabold tracking-tight">{title}</Text>
        <Text className="text-center text-[13px] leading-5 text-muted-foreground">{text}</Text>
      </View>
      <View className="w-full gap-3 rounded-2xl bg-card p-4">
        {rows.map(([label, value]) => (
          <View key={label} className="flex-row justify-between gap-4">
            <Text className="text-[13px] text-muted-foreground">{label}</Text>
            <Text className="min-w-0 flex-1 text-right text-[13px] font-medium">{value}</Text>
          </View>
        ))}
      </View>
      <View className="w-full gap-2.5">
        <ActionButton size="md" label="Back to home" onPress={() => router.navigate('/home')} />
        <ActionButton
          size="md"
          variant="outline"
          label="Book another visit"
          onPress={() => router.replace('/book')}
        />
      </View>
    </View>
  );
}
