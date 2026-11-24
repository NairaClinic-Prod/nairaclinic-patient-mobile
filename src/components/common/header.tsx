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

const TabHeader = ({ title, compactTitle, subtitle, right, gutter = false }: TabHeaderProps) => {
  const register = useHeaderBar();
  const small = compactTitle ?? (typeof title === 'string' ? title : '');

  React.useEffect(() => {
    register?.({ title: small, right });
  }, [register, small, right]);

  return (
    <View
      onLayout={(event) => {
        const { y, height } = event.nativeEvent.layout;
        register?.({ bottom: y + height });
      }}
      className="flex-row items-center justify-between gap-4 pt-4"
      style={gutter ? { paddingHorizontal: SCREEN_PADDING_X } : undefined}>
      <View className="min-w-0 flex-1">
        {typeof title === 'string' ? (
          <Text className="text-xl font-extrabold">{title}</Text>
        ) : (
          title
        )}
        {subtitle ? (
          <Text className="text-muted-foreground mt-0.5 text-xs leading-4.5">{subtitle}</Text>
        ) : null}
      </View>
      {right}
    </View>
  );
};

export default TabHeader;
