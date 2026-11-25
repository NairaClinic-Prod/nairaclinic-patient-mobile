import { useMethodsQuery } from '@/api/payments';
import { useWalletAccount } from '@/api/wallet';
import { Choosable } from '@/components/shared/choosable';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { BRAND_NAME, detectBrand } from '@/features/payment-methods/card-brand';
import { CreditCard, Landmark, Wallet } from 'lucide-react-native';
import { ActivityIndicator, View } from 'react-native';
import type { PayChoice } from '../types';
import { naira } from '../utils';

// What the patient can pay with, read from the wallet and saved cards on the server. A null total
// means the price is set after the request is sent (find me a doctor).
export function usePayment(totalNgn: number | null, picked: PayChoice | null) {
  const wallet = useWalletAccount();
  const methods = useMethodsQuery();
  const balanceNgn = Math.floor(Number(wallet.data?.wallet?.balanceKobo ?? 0) / 100);
  const cards = methods.data ?? [];
  const card = cards.find((item) => item.isDefault) ?? cards[0];
  const known = totalNgn !== null;
  const total = totalNgn ?? 0;
  const walletCovers = known && total > 0 && balanceNgn >= total;

  const choice: PayChoice =
    picked === 'wallet' && walletCovers
      ? 'wallet'
      : picked === 'card' && card
        ? 'card'
        : picked === 'paystack'
          ? 'paystack'
          : walletCovers
            ? 'wallet'
            : card
              ? 'card'
              : 'paystack';

  const fromWallet = known ? Math.min(balanceNgn, total) : 0;
  const charged = choice === 'wallet' ? 0 : Math.max(0, total - fromWallet);
  const label = !known
    ? 'Send request'
    : total === 0
      ? 'Book'
      : choice === 'wallet' || charged === 0
        ? `Book & pay ${naira(total)} from wallet`
        : choice === 'card'
          ? `Book & pay ${naira(charged)} with card`
          : `Book & pay ${naira(charged)} with Paystack`;

  return {
    choice,
    balanceNgn,
    card,
    cards,
    known,
    walletCovers,
    fromWallet,
    label,
    loading: wallet.isPending || methods.isPending,
    paymentMethodId: choice === 'card' ? card?.id : undefined,
  };
}

export type PaymentState = ReturnType<typeof usePayment>;

type PaymentOptionsProps = { payment: PaymentState; onChoice: (choice: PayChoice) => void };

export function PaymentOptions({ payment, onChoice }: PaymentOptionsProps) {
  const { choice, balanceNgn, card, known, walletCovers, fromWallet } = payment;
  const walletLine = payment.loading
    ? 'Checking your balance…'
    : balanceNgn === 0
      ? 'Your wallet is empty.'
      : !known
        ? `${naira(balanceNgn)} is used first. You only pay the rest.`
        : walletCovers
          ? `You have ${naira(balanceNgn)}`
          : `You have ${naira(balanceNgn)}, not enough for this. It comes out first, then ${choice === 'card' ? 'your card' : 'Paystack'} pays the rest.`;

  return (
    <View className="gap-3 rounded-2xl bg-card p-4">
      <Text className="text-[15px] font-bold">How do you want to pay?</Text>
      {known ? (
        <Choosable
          selected={choice === 'wallet'}
          disabled={!walletCovers}
          label="My wallet"
          onPress={() => onChoice('wallet')}>
          <View className="flex-row items-center gap-3 pr-7">
            <Icon as={Wallet} className="size-5 text-primary" />
            <View className="min-w-0 flex-1">
              <Text className="text-[14px] font-semibold">My wallet</Text>
              <Text className="text-xs leading-4 text-muted-foreground">{walletLine}</Text>
            </View>
            {payment.loading ? <ActivityIndicator size="small" /> : null}
          </View>
        </Choosable>
      ) : (
        <Text className="text-xs leading-4.5 text-muted-foreground">{walletLine}</Text>
      )}
      {card ? (
        <Choosable
          selected={choice === 'card'}
          label="My saved card"
          onPress={() => onChoice('card')}>
          <View className="flex-row items-center gap-3 pr-7">
            <Icon as={CreditCard} className="size-5 text-primary" />
            <View className="min-w-0 flex-1">
              <Text className="text-[14px] font-semibold">My saved card</Text>
              <Text className="text-xs leading-4 text-muted-foreground">
                {`${BRAND_NAME[detectBrand(card.brand)]} •••• ${card.last4}${known && fromWallet > 0 && choice === 'card' ? ` · after ${naira(fromWallet)} from your wallet` : ''}`}
              </Text>
            </View>
          </View>
        </Choosable>
      ) : null}
      <Choosable
        selected={choice === 'paystack'}
        label="Pay with Paystack"
        onPress={() => onChoice('paystack')}>
        <View className="flex-row items-center gap-3 pr-7">
          <Icon as={Landmark} className="size-5 text-primary" />
          <View className="min-w-0 flex-1">
            <Text className="text-[14px] font-semibold">Card, transfer or USSD</Text>
            <Text className="text-xs leading-4 text-muted-foreground">
              Pay securely on Paystack's page.
            </Text>
          </View>
        </View>
      </Choosable>
    </View>
  );
}
