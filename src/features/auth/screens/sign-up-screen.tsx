import { AuthLayout } from '@/features/auth/components/auth-layout';
import { CodeActions } from '@/features/auth/components/code-actions';
import { Field } from '@/features/auth/components/field';
import { PhoneField } from '@/features/auth/components/phone-field';
import { PinField } from '@/features/auth/components/pin-field';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Icon } from '@/components/ui/icon';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Text } from '@/components/ui/text';
import { signUpSchemas } from '@/features/auth/schemas';
import { validateNationalPhone } from '@/lib/validation';
import { Stack, router } from 'expo-router';
import { useFormik } from 'formik';
import { Check, Gift, Mail, ShieldCheck, User } from 'lucide-react-native';
import * as React from 'react';
import { View } from 'react-native';
import type { CountryCode } from 'react-native-country-picker-modal';

const SCREEN_OPTIONS = { headerShown: false };
const SEXES = ['Female', 'Male'] as const;

type Step = 'phone' | 'code' | 'details';

type Values = {
  countryCode: CountryCode;
  callingCode: string;
  phone: string;
  code: string;
  name: string;
  sex: string;
  email: string;
  referral: string;
  pin: string;
  confirmPin: string;
  terms: boolean;
};

const INITIAL: Values = {
  countryCode: 'NG',
  callingCode: '234',
  phone: '',
  code: '',
  name: '',
  sex: '',
  email: '',
  referral: '',
  pin: '',
  confirmPin: '',
  terms: false,
};

const COPY: Record<Step, { title: string; subtitle: string; action: string }> = {
  phone: {
    title: 'Create an account',
    subtitle: "Enter your phone number. We'll send a 6-digit code on WhatsApp.",
    action: 'Send code',
  },
  code: {
    title: 'Verify your phone',
    subtitle: 'Enter the 6-digit code we sent on WhatsApp.',
    action: 'Verify phone',
  },
  details: {
    title: 'Your details',
    subtitle: 'Tell us about you and choose a PIN.',
    action: 'Sign Up',
  },
};

export function SignUpScreen() {
  const [step, setStep] = React.useState<Step>('phone');

  const formik = useFormik({
    initialValues: INITIAL,
    validationSchema: signUpSchemas[step],
    onSubmit: async (_values, helpers) => {
      if (step === 'phone') setStep('code');
      else if (step === 'code') setStep('details');
      helpers.setTouched({}, false);
    },
  });

  const values = formik.values;
  const formattedPhone = validateNationalPhone(`+${values.callingCode}`, values.phone).formatted;
  const error = (name: keyof Values) =>
    formik.touched[name] ? (formik.errors[name] as string | undefined) : undefined;
  const set = (name: keyof Values) => (value: string | boolean) =>
    formik.setFieldValue(name, value);
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
      footerText="Already have an account?"
      footerAction="Log In"
      onFooterPress={() => router.replace('/auth/login')}>
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
        <>
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
        </>
      ) : null}

      {step === 'details' ? (
        <>
          <View className="bg-success/10 flex-row items-center gap-2 self-start rounded-full px-3 py-1.5">
            <Icon as={Check} className="text-success size-4" />
            <Text className="text-success text-[13px] font-semibold">
              {formattedPhone} verified
            </Text>
            <Button variant="link" size="sm" className="h-auto px-1 py-0" onPress={changeNumber}>
              <Text className="text-[12px] font-bold">Change</Text>
            </Button>
          </View>

          <Field
            label="Full name"
            icon={User}
            error={error('name')}
            value={values.name}
            onChangeText={set('name')}
            onBlur={touch('name')}
            placeholder="Enter your full name"
            autoComplete="name"
            autoCapitalize="words"
            maxLength={120}
          />

          <View className="gap-2">
            <Label nativeID="sex-label">Sex</Label>
            <RadioGroup value={values.sex} onValueChange={set('sex')} className="flex-row gap-3">
              {SEXES.map((option) => (
                <View
                  key={option}
                  className={`bg-card h-14 flex-1 flex-row items-center gap-3 rounded-full border px-5 ${values.sex === option ? 'border-primary' : 'border-input'}`}>
                  <RadioGroupItem value={option} aria-labelledby={`sex-${option}`} />
                  <Label nativeID={`sex-${option}`} onPress={() => set('sex')(option)}>
                    {option}
                  </Label>
                </View>
              ))}
            </RadioGroup>
            {error('sex') ? (
              <Text className="text-destructive pl-2 text-[13px]">{error('sex')}</Text>
            ) : null}
          </View>

          <Field
            label="Email address (optional)"
            icon={Mail}
            error={error('email')}
            value={values.email}
            onChangeText={set('email')}
            onBlur={touch('email')}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoComplete="email"
            autoCapitalize="none"
          />

          <Field
            label="Referral code (optional)"
            icon={Gift}
            error={error('referral')}
            value={values.referral}
            onChangeText={(text) => set('referral')(text.toUpperCase())}
            placeholder="Enter a referral code if you have one"
            autoCapitalize="characters"
          />

          <PinField
            label="PIN"
            value={values.pin}
            onChangeText={set('pin')}
            onBlur={touch('pin')}
            error={error('pin')}
          />
          <PinField
            label="Confirm PIN"
            value={values.confirmPin}
            onChangeText={set('confirmPin')}
            onBlur={touch('confirmPin')}
            error={error('confirmPin')}
          />

          <View className="gap-2">
            <View className="flex-row items-center gap-2.5">
              <Checkbox id="terms" checked={values.terms} onCheckedChange={set('terms')} />
              <Label
                htmlFor="terms"
                onPress={() => set('terms')(!values.terms)}
                className="flex-1 font-normal">
                I accept the Terms of Service and Privacy Policy
              </Label>
            </View>
            {error('terms') ? (
              <Text className="text-destructive pl-1 text-[13px]">{error('terms')}</Text>
            ) : null}
          </View>
        </>
      ) : null}
    </AuthLayout>
  );
}
