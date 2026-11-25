import { Choosable } from '@/components/shared/choosable';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { detectBrand, BRAND_NAME } from '@/features/payment-methods/card-brand';
import { useCards } from '@/features/payment-methods/store';
import { useWallet } from '@/features/wallet/store';
import { CreditCard, Wallet } from 'lucide-react-native';
import { View } from 'react-native';
import type { PayChoice } from '../types';
import { naira } from '../utils';

export function usePayment(totalNgn: number, choice: PayChoice) {
  const { wallet } = useWallet();
  const { cards } = useCards();
  const balanceNgn = Math.floor(wallet.balanceKobo / 100);
  const card = cards.find((item) => item.isDefault) ?? cards[0];
  const fromWallet = choice === 'wallet' ? Math.min(balanceNgn, totalNgn) : 0;
  const label =
    totalNgn === 0
      ? 'Book'
      : choice === 'wallet' && fromWallet >= totalNgn
        ? `Book & pay ${naira(totalNgn)} from wallet`
        : `Book & pay ${naira(totalNgn - fromWallet)} with card`;
  return { balanceNgn, card, fromWallet, label, hasCard: Boolean(card) };
}

type PaymentOptionsProps = {
  totalNgn: number;
  choice: PayChoice;
  onChoice: (choice: PayChoice) => void;
};

export function PaymentOptions({ totalNgn, choice, onChoice }: PaymentOptionsProps) {
  const { balanceNgn, card, fromWallet } = usePayment(totalNgn, choice);
  const short = balanceNgn < totalNgn;
  const walletLine =
    balanceNgn === 0
      ? 'Your wallet is empty.'
      : choice === 'wallet' && short
        ? `${naira(fromWallet)} comes out of your wallet first, the card pays the rest.`
        : `Balance ${naira(balanceNgn)}`;

  return (
    <View className="gap-3 rounded-2xl bg-card p-4">
      <Text className="text-[15px] font-bold">How do you want to pay?</Text>
      <Choosable
        selected={choice === 'wallet'}
        disabled={balanceNgn === 0}
        label="My wallet"
        onPress={() => onChoice('wallet')}>
        <View className="flex-row items-center gap-3 pr-7">
          <Icon as={Wallet} className="size-5 text-primary" />
          <View className="min-w-0 flex-1">
            <Text className="text-[14px] font-semibold">My wallet</Text>
            <Text className="text-xs leading-4 text-muted-foreground">{walletLine}</Text>
          </View>
        </View>
      </Choosable>
      <Choosable
        selected={choice === 'card'}
        disabled={!card}
        label="My saved card"
        onPress={() => onChoice('card')}>
        <View className="flex-row items-center gap-3 pr-7">
          <Icon as={CreditCard} className="size-5 text-primary" />
          <View className="min-w-0 flex-1">
            <Text className="text-[14px] font-semibold">My saved card</Text>
            <Text className="text-xs leading-4 text-muted-foreground">
              {card
                ? `${BRAND_NAME[detectBrand(card.brand)]} •••• ${card.last4}`
                : 'No saved card yet.'}
            </Text>
          </View>
        </View>
      </Choosable>
    </View>
  );
}
