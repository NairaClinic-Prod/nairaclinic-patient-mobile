import { AuthLayout } from '@/components/auth/auth-layout';
import { Field } from '@/components/auth/field';
import { PinField } from '@/components/auth/pin-field';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { validatePhone, validatePin } from '@/lib/validation';
import { Stack, router } from 'expo-router';
import { Phone } from 'lucide-react-native';
import * as React from 'react';
import { View } from 'react-native';

const SCREEN_OPTIONS = { headerShown: false };

type Errors = { phone?: string; pin?: string };

export default function LoginScreen() {
  const [phone, setPhone] = React.useState('');
  const [pin, setPin] = React.useState('');
  const [keep, setKeep] = React.useState(true);
  const [errors, setErrors] = React.useState<Errors>({});

  function submit() {
    const next: Errors = {};
    const phoneCheck = validatePhone(phone);
    if (!phoneCheck.valid) next.phone = phoneCheck.error;
    const pinCheck = validatePin(pin, { allowWeak: true });
    if (!pinCheck.valid) next.pin = pinCheck.error;
    setErrors(next);
  }

  return (
    <AuthLayout
      title="Log In"
      subtitle="Log in to continue to your health."
      footerText="Don't have an account?"
      footerAction="Sign up"
      onFooterPress={() => router.replace('/sign-up')}>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <Field
        label="Phone number"
        icon={Phone}
        error={errors.phone}
        value={phone}
        onChangeText={setPhone}
        placeholder="08012345678"
        keyboardType="phone-pad"
        autoComplete="tel"
      />
      <PinField value={pin} onChangeText={setPin} error={errors.pin} />

      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Checkbox id="keep" checked={keep} onCheckedChange={setKeep} />
          <Label htmlFor="keep" onPress={() => setKeep((current) => !current)}>
            Keep me logged in.
          </Label>
        </View>
        <Button variant="link" size="sm" className="px-0">
          <Text className="text-[14px] font-bold">Forgot PIN</Text>
        </Button>
      </View>
      <Button size="lg" onPress={submit}>
        <Text className="text-base">Log In</Text>
      </Button>
    </AuthLayout>
  );
}
