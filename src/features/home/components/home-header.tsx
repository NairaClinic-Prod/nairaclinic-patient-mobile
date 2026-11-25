import TabHeader from '@/components/common/header';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Bell } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { greeting } from '../utils';

type HomeHeaderProps = {
  firstName: string;
  unreadCount: number;
  onBellPress?: () => void;
};

export function HomeHeader({ firstName, unreadCount, onBellPress }: HomeHeaderProps) {
  return (
    <TabHeader
      gutter
      compactTitle="Home"
      title={
        <Text className="text-xl leading-7 tracking-tight">
          <Text className="text-xl font-normal">{greeting()}</Text>
          {firstName ? <Text className="text-xl font-extrabold">{`, ${firstName}`}</Text> : null}
        </Text>
      }
      subtitle="How can we care for you today?"
      right={
        <Pressable
          role="button"
          accessibilityLabel={`Notifications, ${unreadCount} unread`}
          onPress={onBellPress}
          className="size-11 items-center justify-center rounded-full bg-card active:opacity-70">
          <Icon as={Bell} className="size-5 text-foreground" />
          {unreadCount > 0 ? (
            <View className="absolute top-2.5 right-2.5 size-2.5 rounded-full border-2 border-card bg-destructive" />
          ) : null}
        </Pressable>
      }
    />
  );
}
