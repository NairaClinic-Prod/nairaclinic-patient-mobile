import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as Haptics from 'expo-haptics';
import * as React from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const PADDING = 3;
const SPRING = { damping: 24, stiffness: 260, mass: 0.7, reduceMotion: ReduceMotion.System };

type Option<T extends string> = { value: T; label: string; count?: number };

type SegmentedControlProps<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  const [width, setWidth] = React.useState(0);
  const index = Math.max(
    0,
    options.findIndex((option) => option.value === value)
  );
  const position = useSharedValue(index);
  const slot = (width - PADDING * 2) / options.length;

  React.useEffect(() => {
    position.set(withSpring(index, SPRING));
  }, [index, position]);

  const indicator = useAnimatedStyle(() => ({
    opacity: width ? 1 : 0,
    width: slot,
    transform: [{ translateX: PADDING + position.get() * slot }],
  }));

  return (
    <View
      role="tablist"
      className="bg-muted h-10 flex-row rounded-full"
      style={{ padding: PADDING }}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
      <Animated.View
        pointerEvents="none"
        className="bg-card absolute rounded-full"
        style={[{ top: PADDING, bottom: PADDING, left: 0 }, indicator]}
      />
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            role="tab"
            accessibilityState={{ selected }}
            onPress={() => {
              if (selected) return;
              Haptics.selectionAsync();
              onChange(option.value);
            }}
            className="flex-1 flex-row items-center justify-center gap-1.5">
            <Text
              className={cn(
                'text-xs font-bold',
                selected ? 'text-foreground' : 'text-muted-foreground'
              )}>
              {option.label}
            </Text>
            {option.count !== undefined ? (
              <Text
                className={cn(
                  'text-xs font-semibold',
                  selected ? 'text-primary' : 'text-muted-foreground'
                )}>
                {option.count}
              </Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}
