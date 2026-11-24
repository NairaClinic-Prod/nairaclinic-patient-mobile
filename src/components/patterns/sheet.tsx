import { BottomSheet, BottomSheetScrollView } from '@/components/ui/bottom-sheet';
import { Text } from '@/components/ui/text';
import { SCREEN_PADDING_X } from '@/constants/ui';
import type * as React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SNAP_POINTS = ['70%', '92%'];

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
  snapPoints = SNAP_POINTS,
  footer,
  children,
}: SheetProps) {
  const insets = useSafeAreaInsets();

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
          <View className="gap-0.5">
            <Text className="text-xl font-extrabold">{title}</Text>
            {subtitle ? <Text className="text-muted-foreground text-xs">{subtitle}</Text> : null}
          </View>
          {children}
        </BottomSheetScrollView>
        {footer ? (
          <View
            style={{
              paddingHorizontal: SCREEN_PADDING_X,
              paddingTop: 12,
              paddingBottom: Math.max(insets.bottom, 16),
            }}>
            {footer}
          </View>
        ) : null}
      </View>
    </BottomSheet>
  );
}
