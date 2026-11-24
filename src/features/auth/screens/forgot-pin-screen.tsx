import { AuthLayout } from '@/features/auth/components/auth-layout';
import { CodeActions } from '@/features/auth/components/code-actions';
import { Field } from '@/features/auth/components/field';
import { PhoneField } from '@/features/auth/components/phone-field';
import { PinField } from '@/features/auth/components/pin-field';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { forgotPinSchemas } from '@/features/auth/schemas';
import { validateNationalPhone } from '@/lib/validation';
import { Stack, router } from 'expo-router';
import { useFormik } from 'formik';
import { CircleCheck, ShieldCheck } from 'lucide-react-native';
import * as React from 'react';
import { View } from 'react-native';
import type { CountryCode } from 'react-native-country-picker-modal';

const SCREEN_OPTIONS = { headerShown: false };

type Step = 'phone' | 'code' | 'pin' | 'done';

type Values = {
  countryCode: CountryCode;
  callingCode: string;
  phone: string;
  code: string;
  pin: string;
  confirmPin: string;
};

const INITIAL: Values = {
  countryCode: 'NG',
  callingCode: '234',
  phone: '',
  code: '',
  pin: '',
  confirmPin: '',
};

const COPY: Record<Step, { title: string; subtitle: string; action: string }> = {
  phone: {
    title: 'Forgot your PIN?',
    subtitle: "Enter your phone number and we'll send a 6-digit code on WhatsApp.",
    action: 'Send code',
  },
  code: {
    title: 'Verify your phone',
    subtitle: 'Enter the 6-digit code we sent on WhatsApp.',
    action: 'Verify phone',
  },
  pin: {
    title: 'Set a new PIN',
    subtitle: 'Choose a new 5-digit PIN you will use to log in.',
    action: 'Reset PIN',
  },
  done: {
    title: 'PIN updated',
    subtitle: 'Your PIN has been changed. Log in with your new PIN.',
    action: 'Back to Log In',
  },
};

export function ForgotPinScreen() {
  const [step, setStep] = React.useState<Step>('phone');

  const formik = useFormik({
    initialValues: INITIAL,
    validationSchema: step === 'done' ? undefined : forgotPinSchemas[step],
    onSubmit: async (_values, helpers) => {
      if (step === 'done') {
        router.replace('/login');
        return;
      }
      if (step === 'phone') setStep('code');
      else if (step === 'code') setStep('pin');
      else setStep('done');
      helpers.setTouched({}, false);
    },
  });

  const values = formik.values;
  const formattedPhone = validateNationalPhone(`+${values.callingCode}`, values.phone).formatted;
  const error = (name: keyof Values) =>
    formik.touched[name] ? (formik.errors[name] as string | undefined) : undefined;
  const set = (name: keyof Values) => (value: string) => formik.setFieldValue(name, value);
  const touch = (name: keyof Values) => () => formik.setFieldTouched(name);

  function changeNumber() {
    formik.setTouched({}, false);
    setStep('phone');
  }

  return (
    <AuthLayout
      title={COPY[step].title}
      subtitle={
        step === 'code'
          ? `Enter the 6-digit code sent to ${formattedPhone} on WhatsApp.`
          : COPY[step].subtitle
      }
      actions={
        <Button size="lg" loading={formik.isSubmitting} onPress={() => formik.handleSubmit()}>
          <Text className="text-base">{COPY[step].action}</Text>
        </Button>
      }
      extra={
        step === 'code' ? (
          <CodeActions
            disabled={values.code.length === 6}
            onResend={() => set('code')('')}
            onChangeNumber={changeNumber}
          />
        ) : null
      }
      footerText="Remembered your PIN?"
      footerAction="Log In"
      onFooterPress={() => router.replace('/login')}>
      <Stack.Screen options={SCREEN_OPTIONS} />

      {step === 'phone' ? (
        <PhoneField
          countryCode={values.countryCode}
          callingCode={values.callingCode}
          onSelectCountry={(country) => {
            formik.setFieldValue('countryCode', country.countryCode);
            formik.setFieldValue('callingCode', country.callingCode);
          }}
          value={values.phone}
          onChangeText={set('phone')}
          onBlur={touch('phone')}
          error={error('phone')}
        />
      ) : null}

      {step === 'code' ? (
        <Field
          label="Verification code"
          icon={ShieldCheck}
          error={error('code')}
          value={values.code}
          onChangeText={(text) => set('code')(text.replace(/\D/g, ''))}
          onBlur={touch('code')}
          placeholder="000000"
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete="sms-otp"
          maxLength={6}
        />
      ) : null}

      {step === 'pin' ? (
        <>
          <PinField
            label="New PIN"
            value={values.pin}
            onChangeText={set('pin')}
            onBlur={touch('pin')}
            error={error('pin')}
          />
          <PinField
            label="Confirm new PIN"
            value={values.confirmPin}
            onChangeText={set('confirmPin')}
            onBlur={touch('confirmPin')}
            error={error('confirmPin')}
          />
        </>
      ) : null}

      {step === 'done' ? (
        <View className="items-center gap-4 py-8">
          <View className="bg-success/10 size-24 items-center justify-center rounded-full">
            <Icon as={CircleCheck} className="text-success size-12" />
          </View>
          <Text className="text-muted-foreground text-center text-base leading-6">
            You can now log in to {formattedPhone} with your new PIN.
          </Text>
        </View>
      ) : null}
    </AuthLayout>
  );
}
