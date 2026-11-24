import { useScrollToFocused } from '@/features/auth/components/auth-layout';
import { CountrySheet } from '@/features/auth/components/country-sheet';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import * as React from 'react';
import { View } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { getEmojiFlag, type CountryCode } from 'react-native-country-picker-modal';

type PhoneFieldProps = {
  label?: string;
  countryCode: CountryCode;
  callingCode: string;
  onSelectCountry: (country: { countryCode: CountryCode; callingCode: string }) => void;
  value: string;
  onChangeText: (value: string) => void;
  onBlur?: () => void;
  error?: string;
};

export function PhoneField({
  label = 'Phone number',
  countryCode,
  callingCode,
  onSelectCountry,
  value,
  onChangeText,
  onBlur,
  error,
}: PhoneFieldProps) {
  const scrollToFocused = useScrollToFocused();
  const [focused, setFocused] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  return (
    <View className="gap-2">
      <Label nativeID="phone-label">{label}</Label>
      <View className="flex-row gap-3">
        <Button
          variant="outline"
          className="bg-card h-14 gap-2 rounded-full px-4"
          onPress={() => setOpen(true)}
          accessibilityLabel="Choose country code">
          <Text className="text-xl">{getEmojiFlag(countryCode)}</Text>
          <Text className="text-base">+{callingCode}</Text>
          <Icon as={ChevronDown} className="text-muted-foreground size-4" />
        </Button>
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
          style={{ height: 56, paddingHorizontal: 20, fontSize: 16 }}
          className={`bg-card flex-1 rounded-full ${error ? 'border-destructive' : focused ? 'border-primary' : ''}`}
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
