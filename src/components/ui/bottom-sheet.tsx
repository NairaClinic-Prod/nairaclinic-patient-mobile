import { useColor } from '@/hooks/use-color';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import * as React from 'react';
import { Dimensions } from 'react-native';

export {
  BottomSheetFlatList,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';

const MAX_HEIGHT_RATIO = 0.92;

type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  snapPoints?: (string | number)[];
  children: React.ReactNode;
};

// Driven by `open`. A close before the sheet appears waits for it, and "push" stops one sheet reopening another.
export function BottomSheet({ open, onClose, snapPoints, children }: BottomSheetProps) {
  const color = useColor();
  const sheet = React.useRef<BottomSheetModal>(null);
  const wantOpen = React.useRef(open);
  const shown = React.useRef(false);
  const closeWhenShown = React.useRef(false);
  const closingByCode = React.useRef(false);
  const latestOnClose = React.useRef(onClose);
  wantOpen.current = open;
  latestOnClose.current = onClose;

  const points = snapPoints?.join('|');
  const stablePoints = React.useMemo(() => snapPoints, [points]);

  React.useEffect(() => {
    if (open) {
      closeWhenShown.current = false;
      sheet.current?.present();
    } else if (shown.current) {
      closingByCode.current = true;
      sheet.current?.dismiss();
    } else {
      closeWhenShown.current = true;
    }
  }, [open]);

  const handleAnimate = React.useCallback((_from: number, to: number) => {
    shown.current = to >= 0;
    if (to >= 0 && (closeWhenShown.current || !wantOpen.current)) {
      closeWhenShown.current = false;
      closingByCode.current = true;
      sheet.current?.dismiss();
    }
  }, []);

  // A dismiss can't be interrupted, so if it was reopened mid-slide, show it again once it is gone.
  const handleDismiss = React.useCallback(() => {
    const byCode = closingByCode.current;
    shown.current = false;
    closeWhenShown.current = false;
    closingByCode.current = false;
    if (!wantOpen.current) return;
    if (byCode) setTimeout(() => wantOpen.current && sheet.current?.present(), 0);
    else latestOnClose.current();
  }, []);

  const backdrop = React.useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
        opacity={0.5}
      />
    ),
    []
  );

  const background = React.useMemo(
    () => ({ backgroundColor: color.card, borderRadius: 32 }),
    [color.card]
  );
  const indicator = React.useMemo(
    () => ({ backgroundColor: color.border, width: 44 }),
    [color.border]
  );

  return (
    <BottomSheetModal
      ref={sheet}
      snapPoints={stablePoints}
      enableDynamicSizing={!stablePoints}
      maxDynamicContentSize={Dimensions.get('window').height * MAX_HEIGHT_RATIO}
      stackBehavior="push"
      enablePanDownToClose
      keyboardBehavior="extend"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      backdropComponent={backdrop}
      onAnimate={handleAnimate}
      onDismiss={handleDismiss}
      backgroundStyle={background}
      handleIndicatorStyle={indicator}>
      {children}
    </BottomSheetModal>
  );
}
