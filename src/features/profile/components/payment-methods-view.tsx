import { ActionButton } from '@/components/shared/action-button';
import { EmptyState } from '@/components/shared/empty-state';
import { Sheet } from '@/components/shared/sheet';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { CreditCard, Landmark, Plus, Share2, Star, Trash2 } from 'lucide-react-native';
import * as React from 'react';
import { Alert, Pressable, Share, View } from 'react-native';
import { CARD_CHECK_NAIRA } from '../constants';
import { makeDefaultCard, removeCard, useProfile } from '../hooks/use-profile';
import type { SavedCard } from '../types';

const label = (card: Pick<SavedCard, 'brand' | 'last4'>) =>
  `${card.brand ? card.brand.charAt(0).toUpperCase() + card.brand.slice(1) : 'Card'} •••• ${card.last4}`;

function confirmRemove(card: SavedCard) {
  Alert.alert(`Remove ${label(card)}?`, 'We stop using this card as soon as you remove it.', [
    { text: 'Keep it', style: 'cancel' },
    { text: 'Remove', style: 'destructive', onPress: () => removeCard(card.id) },
  ]);
}

export function PaymentMethodsView({ onAddCard }: { onAddCard?: () => void }) {
  const { cards, wallet } = useProfile();
  const [adding, setAdding] = React.useState(false);

  return (
    <View className="gap-5">
      <View className="bg-primary gap-4 overflow-hidden rounded-3xl p-5">
        <View
          pointerEvents="none"
          className="absolute -right-10 -bottom-12 size-44 rounded-full bg-white/10"
        />
        <View className="flex-row items-center gap-2">
          <Icon as={Landmark} className="text-primary-foreground/85 size-4" />
          <Text className="text-primary-foreground/85 text-[13px] font-semibold">
            Wallet account
          </Text>
        </View>
        <View className="gap-1">
          <Text
            selectable
            className="text-primary-foreground text-3xl font-extrabold tracking-[2px]">
            {wallet.accountNumber}
          </Text>
          <Text className="text-primary-foreground/80 text-xs" numberOfLines={1}>
            {`${wallet.accountName} · ${wallet.bankName}`}
          </Text>
        </View>
        <Text className="text-primary-foreground/75 text-[11px] leading-4">
          Transfer into this account from any bank app to fund your wallet.
        </Text>
        <Pressable
          role="button"
          onPress={() => Share.share({ message: wallet.accountNumber })}
          className="h-10 flex-row items-center gap-2 self-start rounded-full bg-white/20 px-4 active:opacity-70">
          <Icon as={Share2} className="text-primary-foreground size-4" />
          <Text className="text-primary-foreground text-[13px] font-bold">Share number</Text>
        </Pressable>
      </View>

      <View className="gap-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-bold">
            {'Saved cards '}
            <Text className="text-muted-foreground text-base font-normal">{cards.length}</Text>
          </Text>
          <ActionButton label="Add a card" icon={Plus} onPress={() => setAdding(true)} />
        </View>

        {cards.length ? (
          cards.map((card) => (
            <View key={card.id} className="gap-3">
              <View className="bg-primary aspect-[1.6] justify-between overflow-hidden rounded-3xl p-5">
                <View
                  pointerEvents="none"
                  className="absolute -top-10 -right-10 size-40 rounded-full bg-white/10"
                />
                <View className="flex-row items-center justify-between">
                  <Icon as={CreditCard} className="text-primary-foreground/85 size-6" />
                  {card.isDefault ? (
                    <View className="rounded-full bg-white/20 px-2.5 py-1">
                      <Text className="text-primary-foreground text-[11px] font-semibold">
                        Used first
                      </Text>
                    </View>
                  ) : null}
                </View>
                <Text className="text-primary-foreground text-lg font-semibold tracking-[3px]">
                  {`•••• •••• •••• ${card.last4}`}
                </Text>
                <View className="flex-row items-end justify-between">
                  <Text className="text-primary-foreground/80 text-xs">
                    {card.expiry ? `Expires ${card.expiry}` : 'Saved card'}
                  </Text>
                  <Text className="text-primary-foreground text-base font-bold uppercase">
                    {card.brand ?? 'Card'}
                  </Text>
                </View>
              </View>
              <View className="flex-row justify-end gap-2">
                {card.isDefault ? null : (
                  <ActionButton
                    label="Use first"
                    icon={Star}
                    variant="outline"
                    onPress={() => makeDefaultCard(card.id)}
                  />
                )}
                <ActionButton
                  label="Remove"
                  icon={Trash2}
                  variant="danger"
                  accessibilityLabel={`Remove ${label(card)}`}
                  onPress={() => confirmRemove(card)}
                />
              </View>
            </View>
          ))
        ) : (
          <View className="bg-card rounded-2xl">
            <EmptyState
              icon={CreditCard}
              text="No saved cards yet. Add one now, or it will appear here the first time you pay by card."
            />
          </View>
        )}
      </View>

      <Text className="text-muted-foreground text-xs leading-4.5">
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
              <View className="bg-primary mt-2 size-1.5 rounded-full" />
              <Text className="text-muted-foreground flex-1 text-xs leading-4.5">{line}</Text>
            </View>
          ))}
        </View>
      </Sheet>
    </View>
  );
}
