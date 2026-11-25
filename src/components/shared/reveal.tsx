import { useScrollContext } from '@/components/common/scroll-context';
import { useScreenInsets } from '@/hooks/use-screen-insets';
import * as React from 'react';
import { Dimensions, View, type HostInstance } from 'react-native';

const HEADER_HEIGHT = 64;
const BOTTOM_RESERVE = 190;
const PEEK = 120;
const SETTLE_MS = 140;

type RevealProps = { enabled?: boolean; children: React.ReactNode };

// When this appears (or turns on) below the fold, the page scrolls so it sits just under the header.
export function Reveal({ enabled = true, children }: RevealProps) {
  const ref = React.useRef<HostInstance>(null);
  const scroll = useScrollContext();
  const { top } = useScreenInsets();

  React.useEffect(() => {
    if (!enabled || !scroll) return;
    const timer = setTimeout(() => {
      ref.current?.measureInWindow((_x, y, _width, height) => {
        const limit = Dimensions.get('window').height - BOTTOM_RESERVE;
        if (y + Math.min(height, PEEK) <= limit) return;
        scroll.scrollTo(Math.max(0, scroll.scrollY.get() + y - (top + HEADER_HEIGHT)));
      });
    }, SETTLE_MS);
    return () => clearTimeout(timer);
  }, [enabled, scroll, top]);

  return (
    <View ref={ref} collapsable={false}>
      {children}
    </View>
  );
}
