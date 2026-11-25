import { request } from '../client';
import { PAYMENT_ENDPOINTS as URL } from './endpoints';
import type { PaymentMethod, PaymentVerify } from './type';

export const paymentsApi = {
  methods: () => request<{ methods: PaymentMethod[] }>(URL.methods).then((reply) => reply.methods),

  makeDefault: (methodId: string) =>
    request<{ methods: PaymentMethod[] }>(URL.methodDefault(methodId), { body: {} }).then(
      (reply) => reply.methods
    ),

  removeMethod: (methodId: string) =>
    request<{ methods: PaymentMethod[] }>(URL.method(methodId), { method: 'DELETE' }).then(
      (reply) => reply.methods
    ),

  verify: (reference: string) => request<PaymentVerify>(URL.verify, { body: { reference } }),
};
