import { ActionButton } from '@/components/shared/action-button';
import { EmptyState } from '@/components/shared/empty-state';
import { Sheet } from '@/components/shared/sheet';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { CreditCard, Landmark, Plus, Share2 } from 'lucide-react-native';
import * as React from 'react';
import { Alert, Pressable, Share, View } from 'react-native';
import { CARD_CHECK_NAIRA } from '../constants';
import { BRAND_NAME, detectBrand } from '../card-brand';
import { CardFace } from './card-face';
import { fullName, useProfile } from '@/features/profile/hooks/use-profile';
import { useWallet } from '@/features/wallet/store';
import { makeDefaultCard, removeCard, startAddCard, useCards } from '../store';
import type { SavedCard } from '../types';

const label = (card: Pick<SavedCard, 'brand' | 'last4'>) =>
  `${BRAND_NAME[detectBrand(card.brand)]} •••• ${card.last4}`;

function confirmRemove(card: SavedCard) {
  Alert.alert(`Remove ${label(card)}?`, 'We stop using this card as soon as you remove it.', [
    { text: 'Keep it', style: 'cancel' },
    { text: 'Remove', style: 'destructive', onPress: () => removeCard(card.id) },
  ]);
}

export function PaymentMethodsView({ onAddCard = startAddCard }: { onAddCard?: () => void }) {
  const { cards } = useCards();
  const { wallet } = useWallet();
  const { profile } = useProfile();
  const [adding, setAdding] = React.useState(false);

  return (
    <View className="gap-5">
      <View className="gap-1.5 rounded-2xl bg-primary px-3.5 py-3">
        <View className="flex-row items-center justify-between gap-3">
          <View className="min-w-0 flex-1">
            <View className="flex-row items-center gap-1.5">
              <Icon as={Landmark} className="size-3.5 text-primary-foreground/85" />
              <Text className="text-[11px] font-semibold text-primary-foreground/85">
                Wallet account
              </Text>
            </View>
            <Text
              selectable
              className="text-xl font-extrabold tracking-[1.5px] text-primary-foreground">
              {wallet.accountNumber}
            </Text>
          </View>
          <Pressable
            role="button"
            accessibilityLabel="Share account number"
            onPress={() => Share.share({ message: wallet.accountNumber })}
            className="size-9 items-center justify-center rounded-full bg-white/20 active:opacity-70">
            <Icon as={Share2} className="size-4 text-primary-foreground" />
          </Pressable>
        </View>
        <Text className="text-[11px] text-primary-foreground/75" numberOfLines={1}>
          {`${wallet.accountName} · ${wallet.bankName}`}
        </Text>
      </View>

      <View className="gap-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-bold">
            {'Saved cards '}
            <Text className="text-base font-normal text-muted-foreground">{cards.length}</Text>
          </Text>
          <ActionButton label="Add a card" icon={Plus} onPress={() => setAdding(true)} />
        </View>

        {cards.length ? (
          cards.map((card) => (
            <CardFace
              key={card.id}
              card={card}
              name={fullName(profile)}
              onMakeDefault={() => makeDefaultCard(card.id)}
              onRemove={() => confirmRemove(card)}
            />
          ))
        ) : (
          <View className="rounded-2xl bg-card">
            <EmptyState
              icon={CreditCard}
              text="No saved cards yet. Add one now, or it will appear here the first time you pay by card."
            />
          </View>
        )}
      </View>

      <Text className="text-xs leading-4.5 text-muted-foreground">
        We never see or store your card number. Paystack keeps it, and we keep only a secure token
        and the last four digits. Remove a card here any time and we stop using it.
      </Text>

      <Sheet
        open={adding}
        onClose={() => setAdding(false)}
        title="Add a card"
        subtitle={`Paystack only lets us keep a card after a real payment. So we'll charge you ₦${CARD_CHECK_NAIRA} on the card you add, and refund the full ₦${CARD_CHECK_NAIRA} straight away. Your bank may take a few days to show the refund.`}
        snapPoints={['56%']}
        footer={
          <View className="flex-row gap-2">
            <ActionButton
              size="md"
              label="Cancel"
              variant="outline"
              className="flex-1"
              onPress={() => setAdding(false)}
            />
            <ActionButton
              size="md"
              label="Continue to Paystack"
              className="flex-[2]"
              onPress={() => {
                setAdding(false);
                onAddCard?.();
              }}
            />
          </View>
        }>
        <View className="gap-2.5">
          {[
            "You enter your card details on Paystack's page, never on ours.",
            `The card is saved only if the ₦${CARD_CHECK_NAIRA} payment goes through.`,
            'You can remove the card here any time.',
          ].map((line) => (
            <View key={line} className="flex-row gap-2.5">
              <View className="mt-2 size-1.5 rounded-full bg-primary" />
              <Text className="flex-1 text-xs leading-4.5 text-muted-foreground">{line}</Text>
            </View>
          ))}
        </View>
      </Sheet>
    </View>
  );
}
