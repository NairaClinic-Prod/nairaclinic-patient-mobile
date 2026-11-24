import { BottomSheet, BottomSheetScrollView } from '@/components/ui/bottom-sheet';
import { Text } from '@/components/ui/text';
import { SCREEN_PADDING_X } from '@/constants/ui';
import type * as React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type SheetProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  snapPoints?: (string | number)[];
  footer?: React.ReactNode;
  children?: React.ReactNode;
};

export function Sheet({
  open,
  onClose,
  title,
  subtitle,
  snapPoints,
  footer,
  children,
}: SheetProps) {
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, 16);

  const heading = (
    <View className="gap-0.5">
      <Text className="text-xl font-extrabold">{title}</Text>
      {subtitle ? <Text className="text-muted-foreground text-xs">{subtitle}</Text> : null}
    </View>
  );

  if (!snapPoints) {
    return (
      <BottomSheet open={open} onClose={onClose}>
        <BottomSheetScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: SCREEN_PADDING_X,
            paddingTop: 8,
            paddingBottom: bottom,
            gap: 16,
          }}>
          {heading}
          {children}
          {footer}
        </BottomSheetScrollView>
      </BottomSheet>
    );
  }

  return (
    <BottomSheet open={open} onClose={onClose} snapPoints={snapPoints}>
      <View style={{ flex: 1 }}>
        <BottomSheetScrollView
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: SCREEN_PADDING_X,
            paddingTop: 8,
            paddingBottom: 24,
            gap: 16,
          }}>
          {heading}
          {children}
        </BottomSheetScrollView>
        {footer ? (
          <View
            style={{
              paddingHorizontal: SCREEN_PADDING_X,
              paddingTop: 12,
              paddingBottom: bottom,
            }}>
            {footer}
          </View>
        ) : null}
      </View>
    </BottomSheet>
  );
}
