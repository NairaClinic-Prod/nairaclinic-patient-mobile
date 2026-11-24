import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { SCREEN_PADDING_X } from '@/constants/ui';
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
    <View
      className="flex-row items-start justify-between"
      style={{ paddingHorizontal: SCREEN_PADDING_X }}>
      <View className="flex-1 pr-4">
        <Text className="text-xl leading-7">
          <Text className="text-xl font-normal">{greeting()}</Text>
          {firstName ? <Text className="text-xl font-extrabold">{`, ${firstName}`}</Text> : null}
        </Text>
        <Text className="text-muted-foreground mt-1 text-xs">How can we care for you today?</Text>
      </View>
      <Pressable
        role="button"
        accessibilityLabel={`Notifications, ${unreadCount} unread`}
        onPress={onBellPress}
        className="bg-card size-11 items-center justify-center rounded-full active:opacity-70">
        <Icon as={Bell} className="text-foreground size-5" />
        {unreadCount > 0 ? (
          <View className="bg-destructive border-card absolute right-2.5 top-2.5 size-2.5 rounded-full border-2" />
        ) : null}
      </Pressable>
    </View>
  );
}
