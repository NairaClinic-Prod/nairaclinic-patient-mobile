import { SCREEN_PADDING_X } from '@/constants/ui';
import * as React from 'react';
import { ScrollView } from 'react-native';

export function HScroll({ children }: { children: React.ReactNode }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      decelerationRate="fast"
      contentContainerStyle={{ paddingHorizontal: SCREEN_PADDING_X, gap: 12 }}>
      {children}
    </ScrollView>
  );
}
