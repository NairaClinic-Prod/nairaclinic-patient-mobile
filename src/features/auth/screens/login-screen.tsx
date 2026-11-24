import { AuthLayout } from '@/features/auth/components/auth-layout';
import { PhoneField } from '@/features/auth/components/phone-field';
import { PinField } from '@/features/auth/components/pin-field';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { loginSchema } from '@/features/auth/schemas';
import { Stack, router } from 'expo-router';
import { useFormik } from 'formik';
import { View } from 'react-native';
import type { CountryCode } from 'react-native-country-picker-modal';

const SCREEN_OPTIONS = { headerShown: false };

type Values = {
  countryCode: CountryCode;
  callingCode: string;
  phone: string;
  pin: string;
  keep: boolean;
};

const INITIAL: Values = { countryCode: 'NG', callingCode: '234', phone: '', pin: '', keep: true };

export function LoginScreen() {
  const formik = useFormik({
    initialValues: INITIAL,
    validationSchema: loginSchema,
    onSubmit: async () => undefined,
  });
  const error = (name: 'phone' | 'pin') => (formik.touched[name] ? formik.errors[name] : undefined);

  const handleSubmit = () => {
    formik.handleSubmit();
    router.replace('/home');
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in with your phone number and PIN to continue."
      actions={
        <Button size="lg" loading={formik.isSubmitting} onPress={handleSubmit}>
          <Text className="text-base">Log In</Text>
        </Button>
      }
      footerText="Don't have an account?"
      footerAction="Sign up"
      onFooterPress={() => router.replace('/auth/sign-up')}>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <PhoneField
        countryCode={formik.values.countryCode}
        callingCode={formik.values.callingCode}
        onSelectCountry={(country) => {
          formik.setFieldValue('countryCode', country.countryCode);
          formik.setFieldValue('callingCode', country.callingCode);
        }}
        value={formik.values.phone}
        onChangeText={(text) => formik.setFieldValue('phone', text)}
        onBlur={() => formik.setFieldTouched('phone')}
        error={error('phone')}
      />
      <PinField
        value={formik.values.pin}
        onChangeText={(text) => formik.setFieldValue('pin', text)}
        onBlur={() => formik.setFieldTouched('pin')}
        error={error('pin')}
      />

      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Checkbox
            id="keep"
            checked={formik.values.keep}
            onCheckedChange={(checked) => formik.setFieldValue('keep', checked)}
          />
          <Label htmlFor="keep" onPress={() => formik.setFieldValue('keep', !formik.values.keep)}>
            Keep me logged in
          </Label>
        </View>
        <Button
          variant="link"
          size="sm"
          className="px-0"
          onPress={() => router.push('/auth/forgot-pin')}>
          <Text className="text-[14px] font-bold">Forgot PIN?</Text>
        </Button>
      </View>
    </AuthLayout>
  );
}
