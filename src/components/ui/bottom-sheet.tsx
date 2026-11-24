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

// A modal sheet that lifts above the keyboard. Without snapPoints it grows to fit its content, up to 92% of the screen.
export function BottomSheet({ open, onClose, snapPoints, children }: BottomSheetProps) {
  const color = useColor();
  const ref = React.useRef<BottomSheetModal>(null);

  const presented = React.useRef(false);
  const closedByCode = React.useRef(false);
  const latestOnClose = React.useRef(onClose);
  latestOnClose.current = onClose;

  React.useEffect(() => {
    if (open && !presented.current) {
      presented.current = true;
      closedByCode.current = false;
      ref.current?.present();
    } else if (!open && presented.current) {
      presented.current = false;
      closedByCode.current = true;
      ref.current?.dismiss();
    }
  }, [open]);

  // onClose is for the user closing the sheet (swipe or backdrop). When the parent closes it, the parent already knows.
  function handleDismiss() {
    presented.current = false;
    if (closedByCode.current) {
      closedByCode.current = false;
      return;
    }
    latestOnClose.current();
  }

  const backdrop = React.useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.5} />
    ),
    []
  );

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      enableDynamicSizing={!snapPoints}
      maxDynamicContentSize={Dimensions.get('window').height * MAX_HEIGHT_RATIO}
      enablePanDownToClose
      onDismiss={handleDismiss}
      backdropComponent={backdrop}
      keyboardBehavior="extend"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      backgroundStyle={{ backgroundColor: color.card, borderRadius: 32 }}
      handleIndicatorStyle={{ backgroundColor: color.border, width: 44 }}>
      {children}
    </BottomSheetModal>
  );
}
