import { useScrollToFocused } from '@/components/auth/auth-layout';
import { CountrySheet } from '@/components/auth/country-sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { useColor } from '@/hooks/use-color';
import { FONT } from '@/lib/fonts';
import * as React from 'react';
import { View } from 'react-native';
import {
  DARK_THEME,
  DEFAULT_THEME,
  FlagButton,
  ThemeProvider,
  type CountryCode,
} from 'react-native-country-picker-modal';
import { useUniwind } from 'uniwind';

type PhoneFieldProps = {
  label?: string;
  countryCode: CountryCode;
  onSelectCountry: (country: { countryCode: CountryCode; callingCode: string }) => void;
  value: string;
  onChangeText: (value: string) => void;
  onBlur?: () => void;
  error?: string;
};

export function PhoneField({
  label = 'Phone number',
  countryCode,
  onSelectCountry,
  value,
  onChangeText,
  onBlur,
  error,
}: PhoneFieldProps) {
  const color = useColor();
  const { theme } = useUniwind();
  const scrollToFocused = useScrollToFocused();
  const [focused, setFocused] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  const buttonTheme = {
    ...(theme === 'dark' ? DARK_THEME : DEFAULT_THEME),
    primaryColor: color.primary,
    backgroundColor: color.card,
    onBackgroundTextColor: color.foreground,
    fontFamily: FONT.regular,
    fontSize: 16,
  };

  return (
    <View className="gap-2">
      <Label nativeID="phone-label">{label}</Label>
      <View className="flex-row gap-3">
        <ThemeProvider theme={buttonTheme}>
          <FlagButton
            placeholder="Country"
            countryCode={countryCode}
            withEmoji
            withFlagButton
            withCallingCodeButton
            onOpen={() => setOpen(true)}
            containerButtonStyle={{
              height: 56,
              paddingHorizontal: 16,
              borderRadius: 28,
              borderWidth: 1,
              borderColor: color.input,
              backgroundColor: color.card,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />
        </ThemeProvider>
        <Input
          aria-labelledby="phone-label"
          aria-invalid={!!error}
          value={value}
          onChangeText={(text) => onChangeText(text.replace(/[^\d\s]/g, ''))}
          onFocus={() => {
            setFocused(true);
            scrollToFocused();
          }}
          onBlur={() => {
            setFocused(false);
            onBlur?.();
          }}
          placeholder="801 234 5678"
          keyboardType="phone-pad"
          autoComplete="tel"
          maxLength={14}
          className={`bg-card h-14 flex-1 rounded-full px-5 text-base ${error ? 'border-destructive' : focused ? 'border-primary' : ''}`}
        />
      </View>
      {error ? <Text className="text-destructive pl-2 text-[13px]">{error}</Text> : null}

      <CountrySheet
        open={open}
        onClose={() => setOpen(false)}
        onSelect={(country) =>
          onSelectCountry({ countryCode: country.cca2, callingCode: country.callingCode[0] ?? '' })
        }
      />
    </View>
  );
}
