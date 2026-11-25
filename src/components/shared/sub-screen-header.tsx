import { useHeaderBar } from '@/components/common/collapsing-header';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, View } from 'react-native';

type SubScreenHeaderProps = { title: string; right?: React.ReactNode };

// Inside a fixed layout the bar draws the live row, so this copy only holds its place in the page.
export function SubScreenHeader({ title, right }: SubScreenHeaderProps) {
  const bar = useHeaderBar();
  const fixed = bar?.fixed ?? false;
  const register = bar?.register;

  const row = (
    <View className="h-12 flex-row items-center justify-between">
      <Pressable
        role="button"
        accessibilityLabel="Go back"
        onPress={() => router.back()}
        className="bg-card size-11 items-center justify-center rounded-full active:opacity-70">
        <Icon as={ChevronLeft} className="text-foreground size-5" />
      </Pressable>
      <Text className="text-base font-extrabold">{title}</Text>
      <View className="size-11 items-center justify-center">{right}</View>
    </View>
  );

  React.useEffect(() => {
    register?.({ title, right, content: fixed ? row : undefined });
  });

  return (
    <View
      pointerEvents={fixed ? 'none' : 'auto'}
      style={fixed ? { opacity: 0 } : undefined}
      onLayout={(event) => {
        const { y, height } = event.nativeEvent.layout;
        register?.({ bottom: y + height });
      }}>
      {row}
    </View>
  );
}
