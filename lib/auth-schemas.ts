import { splitName, validateNationalPhone, validatePin } from '@/lib/validation';
import * as Yup from 'yup';

const phone = Yup.string()
  .required('Enter your phone number')
  .test('phone', 'Enter a valid phone number', function (value) {
    const result = validateNationalPhone(`+${this.parent.callingCode}`, value ?? '');
    return result.valid || this.createError({ message: result.error });
  });

const pin = (allowWeak: boolean) =>
  Yup.string().test('pin', 'PIN must be 5 digits', function (value) {
    const result = validatePin(value ?? '', { allowWeak });
    return result.valid || this.createError({ message: result.error });
  });

export const loginSchema = Yup.object({
  phone,
  pin: pin(true),
});

export const signUpSchemas = {
  phone: Yup.object({ phone }),
  code: Yup.object({
    code: Yup.string().matches(/^\d{6}$/, 'Enter the 6-digit code.'),
  }),
  details: Yup.object({
    name: Yup.string().test(
      'name',
      'Enter your full name.',
      (value) => splitName(value ?? '').firstName.length >= 2
    ),
    sex: Yup.string().oneOf(['Female', 'Male'], 'Select your sex.').required('Select your sex.'),
    email: Yup.string().email('Enter a valid email address.'),
    referral: Yup.string(),
    pin: pin(false),
    confirmPin: Yup.string().oneOf([Yup.ref('pin')], "PINs don't match."),
    terms: Yup.boolean().oneOf([true], 'Accept the terms to continue.'),
  }),
};

export const forgotPinSchemas = {
  phone: signUpSchemas.phone,
  code: signUpSchemas.code,
  pin: Yup.object({
    pin: pin(false),
    confirmPin: Yup.string().oneOf([Yup.ref('pin')], "PINs don't match."),
  }),
};
