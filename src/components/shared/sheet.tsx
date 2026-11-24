import { SheetScrollContext } from '@/components/shared/sheet-context';
import { BottomSheet, BottomSheetScrollView } from '@/components/ui/bottom-sheet';
import type { BottomSheetScrollViewMethods } from '@gorhom/bottom-sheet';
import { PressableScale } from '@/components/shared/pressable-scale';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react-native';
import { SCREEN_PADDING_X, SHEET_FOOTER_GAP } from '@/constants/ui';
import { useSheetBottom } from '@/hooks/use-screen-insets';
import * as React from 'react';
import { View, type HostInstance } from 'react-native';

type SheetProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  eyebrow?: string;
  showClose?: boolean;
  divided?: boolean;
  snapPoints?: (string | number)[];
  footer?: React.ReactNode;
  children?: React.ReactNode;
};

export function Sheet({
  open,
  onClose,
  title,
  subtitle,
  eyebrow,
  showClose = false,
  divided = false,
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
    <View className="flex-row items-start justify-between gap-3">
      <View className="min-w-0 flex-1 gap-1">
        {eyebrow ? (
          <Text className="text-primary text-[11px] font-semibold tracking-[1.6px] uppercase">
            {eyebrow}
          </Text>
        ) : null}
        <Text
          className={cn(
            'font-extrabold tracking-tight',
            eyebrow ? 'text-[22px] leading-7' : 'text-xl'
          )}>
          {title}
        </Text>
        {subtitle ? (
          <Text className={cn('text-muted-foreground text-xs', eyebrow && 'mt-1 leading-4.5')}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {showClose ? (
        <PressableScale
          scaleTo={0.9}
          role="button"
          accessibilityLabel="Close"
          hitSlop={8}
          onPress={onClose}
          className="bg-muted size-8 items-center justify-center rounded-full">
          <Icon as={X} className="text-muted-foreground size-4" />
        </PressableScale>
      ) : null}
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
                paddingBottom: footer ? SHEET_FOOTER_GAP : bottom,
                gap: 16,
              }}>
              {heading}
              {children}
            </BottomSheetScrollView>
          </View>
          {footer ? (
            <View
              className={divided ? 'border-border border-t' : undefined}
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
