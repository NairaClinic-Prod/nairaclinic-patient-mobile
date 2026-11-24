import { useColor } from '@/hooks/use-color';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import * as React from 'react';

export {
  BottomSheetFlatList,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';

const DEFAULT_SNAP_POINTS = ['65%', '92%'];

type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  snapPoints?: (string | number)[];
  children: React.ReactNode;
};

// A modal sheet that lifts above the keyboard. Put a header outside the list to keep it pinned.
export function BottomSheet({
  open,
  onClose,
  snapPoints = DEFAULT_SNAP_POINTS,
  children,
}: BottomSheetProps) {
  const color = useColor();
  const ref = React.useRef<BottomSheetModal>(null);

  const presented = React.useRef(false);

  React.useEffect(() => {
    if (open && !presented.current) {
      presented.current = true;
      ref.current?.present();
    } else if (!open && presented.current) {
      presented.current = false;
      ref.current?.dismiss();
    }
  }, [open]);

  function handleDismiss() {
    presented.current = false;
    onClose();
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
      enableDynamicSizing={false}
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
