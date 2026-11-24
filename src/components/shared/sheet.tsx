import { SheetScrollContext } from '@/components/shared/sheet-context';
import { BottomSheet, BottomSheetScrollView } from '@/components/ui/bottom-sheet';
import type { BottomSheetScrollViewMethods } from '@gorhom/bottom-sheet';
import { Text } from '@/components/ui/text';
import { SCREEN_PADDING_X } from '@/constants/ui';
import { useSheetBottom } from '@/hooks/use-screen-insets';
import * as React from 'react';
import { View, type HostInstance } from 'react-native';

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
  const bottom = useSheetBottom();
  const frame = React.useRef<HostInstance>(null);
  const scroll = React.useRef<BottomSheetScrollViewMethods>(null);
  const offset = React.useRef(0);

  // Waits for the keyboard to settle, then scrolls the field up if it is hidden behind it or the pinned footer.
  const reveal = React.useCallback((field: React.RefObject<HostInstance | null>) => {
    setTimeout(() => {
      field.current?.measureInWindow((_x, fieldY, _w, fieldH) => {
        frame.current?.measureInWindow((_fx, frameY, _fw, frameH) => {
          const top = fieldY - frameY;
          if (top >= 0 && top + fieldH <= frameH - 16) return;
          scroll.current?.scrollTo({ y: Math.max(0, top + offset.current - 24), animated: true });
        });
      });
    }, 350);
  }, []);

  const heading = (
    <View className="gap-0.5">
      <Text className="text-xl font-extrabold tracking-tight">{title}</Text>
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
      <SheetScrollContext.Provider value={{ reveal }}>
        <View style={{ flex: 1 }}>
          <View ref={frame} style={{ flex: 1 }}>
            <BottomSheetScrollView
              ref={scroll}
              onScroll={(event) => {
                offset.current = event.nativeEvent.contentOffset.y;
              }}
              style={{ flex: 1 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: SCREEN_PADDING_X,
                paddingTop: 8,
                paddingBottom: footer ? 0 : bottom,
                gap: 16,
              }}>
              {heading}
              {children}
            </BottomSheetScrollView>
          </View>
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
      </SheetScrollContext.Provider>
    </BottomSheet>
  );
}
