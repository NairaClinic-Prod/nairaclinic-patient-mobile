import { useHeaderBar } from '@/components/common/collapsing-header';
import { Text } from '@/components/ui/text';
import { SCREEN_PADDING_X } from '@/constants/ui';
import * as React from 'react';
import { View } from 'react-native';

type TabHeaderProps = {
  title: React.ReactNode;
  compactTitle?: string;
  subtitle?: string;
  right?: React.ReactNode;
  gutter?: boolean;
};

// In a fixed layout the bar draws the live header, so the copy in the page only holds its place.
const TabHeader = ({ title, compactTitle, subtitle, right, gutter = false }: TabHeaderProps) => {
  const bar = useHeaderBar();
  const fixed = bar?.fixed ?? false;
  const register = bar?.register;
  const small = compactTitle ?? (typeof title === 'string' ? title : '');

  const row = (
    <View
      className="flex-row items-center justify-between gap-4 pt-4"
      style={gutter ? { paddingHorizontal: SCREEN_PADDING_X } : undefined}>
      <View className="min-w-0 flex-1">
        {typeof title === 'string' ? (
          <Text className="text-xl font-extrabold tracking-tight">{title}</Text>
        ) : (
          title
        )}
        {subtitle ? (
          <Text className="mt-0.5 text-xs leading-4.5 text-muted-foreground">{subtitle}</Text>
        ) : null}
      </View>
      {right}
    </View>
  );

  React.useEffect(() => {
    register?.({ title: small, right, content: fixed ? row : undefined });
  });

  return (
    <View
      pointerEvents={fixed ? 'none' : 'auto'}
      style={fixed ? { opacity: 0 } : undefined}
      onLayout={(event) => {
        const { y, height } = event.nativeEvent.layout;
        register?.({ bottom: y + height });
      }}>
      {row}
    </View>
  );
};

export default TabHeader;
