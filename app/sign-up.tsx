import { AuthLayout } from '@/components/auth/auth-layout';
import { Field } from '@/components/auth/field';
import { PinField } from '@/components/auth/pin-field';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Icon } from '@/components/ui/icon';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Text } from '@/components/ui/text';
import { splitName, validateEmail, validatePhone, validatePin } from '@/lib/validation';
import { Stack, router } from 'expo-router';
import { Check, Gift, Mail, Phone, ShieldCheck, User } from 'lucide-react-native';
import * as React from 'react';
import { View } from 'react-native';

const SCREEN_OPTIONS = { headerShown: false };
const SEXES = ['Female', 'Male'] as const;

type Step = 'phone' | 'code' | 'details';
type Errors = Partial<
  Record<
    'phone' | 'code' | 'name' | 'sex' | 'email' | 'referral' | 'pin' | 'confirmPin' | 'terms',
    string
  >
>;

const COPY: Record<Step, { title: string; subtitle: string }> = {
  phone: {
    title: 'Create an account',
    subtitle: "Enter your phone number. We'll send a 6-digit code on WhatsApp.",
  },
  code: { title: 'Verify your phone', subtitle: 'Enter the 6-digit code we sent on WhatsApp.' },
  details: { title: 'Your details', subtitle: 'Tell us about you and choose a PIN.' },
};

export default function SignUpScreen() {
  const [step, setStep] = React.useState<Step>('phone');
  const [phone, setPhone] = React.useState('');
  const [code, setCode] = React.useState('');
  const [name, setName] = React.useState('');
  const [sex, setSex] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [referral, setReferral] = React.useState('');
  const [pin, setPin] = React.useState('');
  const [confirmPin, setConfirmPin] = React.useState('');
  const [terms, setTerms] = React.useState(false);
  const [errors, setErrors] = React.useState<Errors>({});

  const formattedPhone = validatePhone(phone).formatted;

  function sendCode() {
    const check = validatePhone(phone);
    if (!check.valid) return setErrors({ phone: check.error });
    setErrors({});
    setCode('');
    setStep('code');
  }

  function verifyCode() {
    if (!/^\d{6}$/.test(code)) return setErrors({ code: 'Enter the 6-digit code.' });
    setErrors({});
    setStep('details');
  }

  function changeNumber() {
    setErrors({});
    setStep('phone');
  }

  function submit() {
    const next: Errors = {};
    if (splitName(name).firstName.length < 2) next.name = 'Enter your full name.';
    if (!sex) next.sex = 'Select your sex.';
    if (email.trim() && !validateEmail(email)) next.email = 'Enter a valid email address.';
    const pinCheck = validatePin(pin);
    if (!pinCheck.valid) next.pin = pinCheck.error;
    else if (pin !== confirmPin) next.confirmPin = "PINs don't match.";
    if (!terms) next.terms = 'Accept the terms to continue.';
    setErrors(next);
  }

  return (
    <AuthLayout
      title={COPY[step].title}
      subtitle={
        step === 'code'
          ? `Enter the 6-digit code sent to ${formattedPhone} on WhatsApp.`
          : COPY[step].subtitle
      }
      footerText="Already have an account?"
      footerAction="Log In"
      onFooterPress={() => router.replace('/login')}>
      <Stack.Screen options={SCREEN_OPTIONS} />

      {step === 'phone' ? (
        <>
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
          <Button size="lg" onPress={sendCode}>
            <Text className="text-base">Send code</Text>
          </Button>
        </>
      ) : null}

      {step === 'code' ? (
        <>
          <Field
            label="Verification code"
            icon={ShieldCheck}
            error={errors.code}
            value={code}
            onChangeText={(text) => setCode(text.replace(/\D/g, ''))}
            placeholder="000000"
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            autoComplete="sms-otp"
            maxLength={6}
          />
          <Button size="lg" onPress={verifyCode}>
            <Text className="text-base">Verify phone</Text>
          </Button>
          <View className="flex-row items-center justify-center gap-2">
            <Button variant="link" size="sm" onPress={() => setCode('')}>
              <Text className="text-[14px] font-bold">Resend code</Text>
            </Button>
            <Button variant="link" size="sm" onPress={changeNumber}>
              <Text className="text-[14px] font-bold">Use a different number</Text>
            </Button>
          </View>
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
            error={errors.name}
            value={name}
            onChangeText={setName}
            placeholder="Enter your full name"
            autoComplete="name"
            autoCapitalize="words"
            maxLength={120}
          />

          <View className="gap-2">
            <Label nativeID="sex-label">Sex</Label>
            <RadioGroup value={sex} onValueChange={setSex} className="flex-row gap-3">
              {SEXES.map((option) => (
                <View
                  key={option}
                  className={`bg-card h-14 flex-1 flex-row items-center gap-3 rounded-full border px-5 ${sex === option ? 'border-primary' : 'border-input'}`}>
                  <RadioGroupItem value={option} aria-labelledby={`sex-${option}`} />
                  <Label nativeID={`sex-${option}`} onPress={() => setSex(option)}>
                    {option}
                  </Label>
                </View>
              ))}
            </RadioGroup>
            {errors.sex ? (
              <Text className="text-destructive pl-2 text-[13px]">{errors.sex}</Text>
            ) : null}
          </View>

          <Field
            label="Email address (optional)"
            icon={Mail}
            error={errors.email}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoComplete="email"
            autoCapitalize="none"
          />

          <Field
            label="Referral code (optional)"
            icon={Gift}
            error={errors.referral}
            value={referral}
            onChangeText={(text) => setReferral(text.toUpperCase())}
            placeholder="Enter a referral code if you have one"
            autoCapitalize="characters"
          />

          <PinField label="PIN" value={pin} onChangeText={setPin} error={errors.pin} />
          <PinField
            label="Confirm PIN"
            placeholder="Enter your PIN again"
            value={confirmPin}
            onChangeText={setConfirmPin}
            error={errors.confirmPin}
          />

          <View className="gap-2">
            <View className="flex-row items-center gap-2.5">
              <Checkbox id="terms" checked={terms} onCheckedChange={setTerms} />
              <Label
                htmlFor="terms"
                onPress={() => setTerms((current) => !current)}
                className="flex-1 font-normal">
                I accept the Terms of Service and Privacy Policy
              </Label>
            </View>
            {errors.terms ? (
              <Text className="text-destructive pl-1 text-[13px]">{errors.terms}</Text>
            ) : null}
          </View>
          <Button size="lg" onPress={submit}>
            <Text className="text-base">Sign Up</Text>
          </Button>
        </>
      ) : null}
    </AuthLayout>
  );
}
