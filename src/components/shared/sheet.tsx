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
import { Dimensions, Keyboard, View, type HostInstance } from 'react-native';

type SheetProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  eyebrow?: string;
  showClose?: boolean;
  divided?: boolean;
  hideFooterWithKeyboard?: boolean;
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
  hideFooterWithKeyboard = false,
  snapPoints,
  footer,
  children,
}: SheetProps) {
  const bottom = useSheetBottom();
  const [keyboard, setKeyboard] = React.useState(false);

  React.useEffect(() => {
    if (!hideFooterWithKeyboard) return;
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboard(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboard(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, [hideFooterWithKeyboard]);

  // While typing, the footer steps aside so nothing sits between the field and its suggestions.
  const pinned = hideFooterWithKeyboard && keyboard ? undefined : footer;
  const frame = React.useRef<HostInstance>(null);
  const scroll = React.useRef<BottomSheetScrollViewMethods>(null);
  const offset = React.useRef(0);

  // Waits for the keyboard to settle, then scrolls the field into view. With toTop it always moves to the top edge, to leave room for suggestions.
  const reveal = React.useCallback((field: React.RefObject<HostInstance | null>, toTop = false) => {
    setTimeout(() => {
      field.current?.measureInWindow((_x, fieldY, _w, fieldH) => {
        frame.current?.measureInWindow((_fx, frameY, _fw, frameH) => {
          const top = fieldY - frameY;
          if (!toTop && top >= 0 && top + fieldH <= frameH - 16) return;
          const gap = toTop ? 8 : 24;
          scroll.current?.scrollTo({ y: Math.max(0, top + offset.current - gap), animated: true });
        });
      });
    }, 350);
  }, []);

  const heading = (
    <View className="flex-row items-start justify-between gap-3">
      <View className="min-w-0 flex-1 gap-1">
        {eyebrow ? (
          <Text className="text-[11px] font-semibold tracking-[1.6px] text-primary uppercase">
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
          <Text className={cn('text-xs text-muted-foreground', eyebrow && 'mt-1 leading-4.5')}>
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
          className="size-8 items-center justify-center rounded-full bg-muted">
          <Icon as={X} className="size-4 text-muted-foreground" />
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
              keyboardDismissMode={hideFooterWithKeyboard ? 'on-drag' : undefined}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: SCREEN_PADDING_X,
                paddingTop: 8,
                paddingBottom: pinned
                  ? SHEET_FOOTER_GAP
                  : keyboard
                    ? Dimensions.get('window').height * 0.55
                    : bottom,
                gap: 16,
              }}>
              {heading}
              {children}
            </BottomSheetScrollView>
          </View>
          {pinned ? (
            <View
              className={divided ? 'border-t border-border' : undefined}
              style={{
                paddingHorizontal: SCREEN_PADDING_X,
                paddingTop: 12,
                paddingBottom: bottom,
              }}>
              {pinned}
            </View>
          ) : null}
        </View>
      </SheetScrollContext.Provider>
    </BottomSheet>
  );
}
