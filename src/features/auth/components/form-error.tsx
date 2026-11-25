import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { CircleAlert } from 'lucide-react-native';
import { View } from 'react-native';

export const errorMessage = (
  error: unknown,
  fallback = 'Something went wrong. Please try again.'
) => (error instanceof Error && error.message ? error.message : fallback);

export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <View
      role="alert"
      className="flex-row items-start gap-2.5 rounded-2xl bg-destructive/10 px-4 py-3">
      <Icon as={CircleAlert} className="mt-0.5 size-4 text-destructive" />
      <Text className="flex-1 text-[13px] leading-5 text-destructive">{message}</Text>
    </View>
  );
}
