import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { initials } from '@/features/home/utils';
import { View } from 'react-native';

type DoctorAvatarProps = { name: string; size?: number; online?: boolean; className?: string };

export function DoctorAvatar({ name, size = 56, online, className }: DoctorAvatarProps) {
  return (
    <View
      className={cn('items-center justify-center rounded-full bg-secondary', className)}
      style={{ width: size, height: size }}>
      <Text className="font-bold text-secondary-foreground" style={{ fontSize: size * 0.34 }}>
        {initials(name)}
      </Text>
      {online ? (
        <View className="absolute right-0 bottom-0 size-3.5 rounded-full border-2 border-card bg-success" />
      ) : null}
    </View>
  );
}
