import { SubScreen } from '@/components/shared/sub-screen';
import { PaymentMethodsView } from '../components/payment-methods-view';

export function PaymentMethodsScreen() {
  return (
    <SubScreen title="Payment methods" description="">
      {/* Add a card, or pay with one and we keep it. Pay with a saved card in a tap, and if a renewal fails on one card we try the others. */}
      <PaymentMethodsView />
    </SubScreen>
  );
}
