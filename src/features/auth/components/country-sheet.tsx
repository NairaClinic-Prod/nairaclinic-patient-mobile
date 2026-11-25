import {
  BottomSheet,
  BottomSheetFlatList,
  BottomSheetTextInput,
} from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { SCREEN_PADDING_X } from '@/constants/ui';
import { useColor } from '@/hooks/use-color';
import { FONT } from '@/lib/fonts';
import { Search, X } from 'lucide-react-native';
import * as React from 'react';
import { Keyboard, Pressable, View } from 'react-native';
import {
  FlagType,
  getAllCountries,
  getEmojiFlag,
  type Country,
} from 'react-native-country-picker-modal';
import { useSheetBottom } from '@/hooks/use-screen-insets';

const ROW_HEIGHT = 56;

const CountryRow = React.memo(function CountryRow({
  country,
  onPress,
}: {
  country: Country;
  onPress: (country: Country) => void;
}) {
  return (
    <Pressable
      onPress={() => onPress(country)}
      style={{ height: ROW_HEIGHT }}
      className="flex-row items-center gap-3 border-b border-border active:opacity-60">
      <Text className="text-2xl">{getEmojiFlag(country.cca2)}</Text>
      <Text className="flex-1 text-base" numberOfLines={1}>
        {String(country.name)}
      </Text>
      <Text className="text-base text-muted-foreground">+{country.callingCode[0]}</Text>
    </Pressable>
  );
});

type CountrySheetProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (country: Country) => void;
};

export function CountrySheet({ open, onClose, onSelect }: CountrySheetProps) {
  const color = useColor();
  const sheetBottom = useSheetBottom();
  const [filter, setFilter] = React.useState('');
  const [focused, setFocused] = React.useState(false);
  const [countries, setCountries] = React.useState<Country[]>([]);

  React.useEffect(() => {
    getAllCountries(FlagType.EMOJI).then(setCountries).catch(console.warn);
  }, []);

  const results = React.useMemo(() => {
    const query = filter.trim().toLowerCase().replace(/^\+/, '');
    if (!query) return countries;
    return countries.filter(
      (country) =>
        String(country.name).toLowerCase().includes(query) ||
        country.callingCode.some((code) => code.startsWith(query))
    );
  }, [countries, filter]);

  // The keyboard goes down first, then the sheet follows.
  const pick = React.useCallback(
    (country: Country) => {
      const finish = () => {
        onSelect(country);
        setFilter('');
        onClose();
      };
      if (Keyboard.isVisible()) {
        Keyboard.dismiss();
        setTimeout(finish, 260);
      } else {
        finish();
      }
    },
    [onSelect, onClose]
  );

  function close() {
    setFilter('');
    onClose();
  }

  return (
    <BottomSheet open={open} onClose={close}>
      <View style={{ paddingHorizontal: SCREEN_PADDING_X }} className="pt-2 pb-3">
        <View className="justify-center">
          <BottomSheetTextInput
            value={filter}
            onChangeText={setFilter}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Search country or code"
            placeholderTextColor={color.mutedForeground}
            autoCorrect={false}
            returnKeyType="search"
            style={{
              height: 56,
              borderRadius: 28,
              borderWidth: 1,
              borderColor: focused ? color.primary : 'transparent',
              backgroundColor: color.muted,
              color: color.foreground,
              fontFamily: FONT.regular,
              fontSize: 16,
              paddingLeft: 48,
              paddingRight: 48,
            }}
          />
          <View className="absolute left-4" pointerEvents="none">
            <Icon
              as={Search}
              className={`size-5 ${focused ? 'text-primary' : 'text-muted-foreground'}`}
            />
          </View>
          {filter ? (
            <View className="absolute right-2">
              <Button
                variant="ghost"
                size="icon"
                className="size-10 rounded-full"
                onPress={() => setFilter('')}
                accessibilityLabel="Clear search">
                <Icon as={X} className="size-4 text-muted-foreground" />
              </Button>
            </View>
          ) : null}
        </View>
      </View>

      <BottomSheetFlatList
        data={results}
        keyExtractor={(country: Country) => country.cca2}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: SCREEN_PADDING_X,
          paddingBottom: sheetBottom,
        }}
        ListEmptyComponent={
          <Text className="py-10 text-center text-muted-foreground">No country found</Text>
        }
        renderItem={({ item }: { item: Country }) => <CountryRow country={item} onPress={pick} />}
        getItemLayout={(_: unknown, index: number) => ({
          length: ROW_HEIGHT,
          offset: ROW_HEIGHT * index,
          index,
        })}
        initialNumToRender={12}
        maxToRenderPerBatch={12}
        windowSize={7}
        removeClippedSubviews
      />
    </BottomSheet>
  );
}
