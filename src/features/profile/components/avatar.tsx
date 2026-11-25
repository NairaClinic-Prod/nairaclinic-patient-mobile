import { Text } from '@/components/ui/text';
import { Image, View } from 'react-native';

type AvatarProps = { uri: string | null; initials: string; size?: number };

// The uploaded photo when there is one, otherwise the initials.
export function Avatar({ uri, initials, size = 96 }: AvatarProps) {
  return (
    <View
      className="items-center justify-center overflow-hidden rounded-full bg-secondary"
      style={{ width: size, height: size }}>
      {uri ? (
        <Image
          source={{ uri }}
          accessibilityLabel="Your profile photo"
          style={{ width: size, height: size }}
        />
      ) : (
        <Text className="font-extrabold text-primary" style={{ fontSize: size * 0.32 }}>
          {initials}
        </Text>
      )}
    </View>
  );
}
