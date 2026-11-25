import { Icon } from '@/components/ui/icon';
import { User } from 'lucide-react-native';
import { Image, View } from 'react-native';

type AvatarProps = { uri: string | null; size?: number };

// The uploaded photo when there is one, otherwise a default person icon.
export function Avatar({ uri, size = 96 }: AvatarProps) {
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
        <Icon as={User} size={size * 0.45} className="text-muted-foreground" />
      )}
    </View>
  );
}
