import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import type * as React from 'react';
import { Pressable, View } from 'react-native';

type SubScreenHeaderProps = { title: string; right?: React.ReactNode };

export function SubScreenHeader({ title, right }: SubScreenHeaderProps) {
  return (
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
}
