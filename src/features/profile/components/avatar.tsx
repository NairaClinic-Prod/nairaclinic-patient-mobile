import { Text } from '@/components/ui/text';
import { Image, View } from 'react-native';

type AvatarProps = { uri: string | null; initials: string; size?: number };

// The uploaded photo when there is one, otherwise the initials.
export function Avatar({ uri, initials, size = 96 }: AvatarProps) {
  return (
    <View
      className="bg-secondary items-center justify-center overflow-hidden rounded-full"
      style={{ width: size, height: size }}>
      {uri ? (
        <Image
          source={{ uri }}
          accessibilityLabel="Your profile photo"
          style={{ width: size, height: size }}
        />
      ) : (
        <Text className="text-primary font-extrabold" style={{ fontSize: size * 0.32 }}>
          {initials}
        </Text>
      )}
    </View>
  );
}
