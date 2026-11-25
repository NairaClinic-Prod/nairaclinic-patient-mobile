import { ActionButton } from '@/components/shared/action-button';
import { SegmentedControl } from '@/components/shared/segmented-control';
import { Sheet } from '@/components/shared/sheet';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { formatDay, formatNaira } from '@/features/orders/utils';
import { cn } from '@/lib/utils';
import { Check, HeartPulse, Wallet } from 'lucide-react-native';
import * as React from 'react';
import { Alert, Linking, View } from 'react-native';
import { PLAN_AUDIENCES } from '../constants';
import {
  TIERS,
  cancelRenewal,
  membershipStore,
  type MembershipTier,
  type PlanAudience,
} from '../pages-data';

function TierCard({
  tier,
  featured,
  onChoose,
}: {
  tier: MembershipTier;
  featured: boolean;
  onChoose: (tier: MembershipTier) => void;
}) {
  return (
    <View className="bg-card gap-3 rounded-2xl p-4">
      <View className="flex-row items-center justify-between">
        <View className="bg-secondary size-9 items-center justify-center rounded-lg">
          <Icon as={HeartPulse} className="text-primary size-4.5" />
        </View>
        {featured ? (
          <View className="bg-primary rounded-full px-2.5 py-1">
            <Text className="text-primary-foreground text-[11px] font-bold">Recommended</Text>
          </View>
        ) : null}
      </View>
      <View className="gap-1">
        <Text className="text-lg font-extrabold">{tier.name}</Text>
        <Text className="text-muted-foreground text-[13px] leading-5">{tier.description}</Text>
      </View>
      <Text className="text-2xl font-extrabold tracking-tight">{tier.priceLabel}</Text>
      <View className="gap-2">
        {tier.benefits.map((benefit) => (
          <View key={benefit} className="flex-row items-start gap-2.5">
            <Icon as={Check} className="text-success mt-0.5 size-4" />
            <Text className="flex-1 text-[13px] leading-5">{benefit}</Text>
          </View>
        ))}
      </View>
      <ActionButton
        size="md"
        variant={tier.contact ? 'outline' : 'primary'}
        disabled={tier.priceNgn === 0}
        label={
          tier.contact
            ? 'Contact us'
            : tier.priceNgn === 0
              ? 'Your free plan'
              : `Choose ${tier.name}`
        }
        onPress={() =>
          tier.contact ? Linking.openURL('https://nairaclinic.com/contact') : onChoose(tier)
        }
      />
    </View>
  );
}

export function MembershipView() {
  const { current } = membershipStore.use();
  const plan = current ? TIERS.find((tier) => tier.id === current.tierId) : undefined;
  const [audience, setAudience] = React.useState<PlanAudience>(plan?.audience ?? 'individual');
  const [paying, setPaying] = React.useState<MembershipTier | null>(null);

  const price = plan?.priceNgn ?? 0;
  const tiers = TIERS.filter(
    (tier) =>
      tier.audience === audience &&
      (!plan || (tier.id !== plan.id && (tier.priceNgn ?? Infinity) > price))
  );
  const left = current ? current.includedVisits - current.usedVisits : 0;

  return (
    <View className="gap-5">
      {current && plan ? (
        <View className="bg-primary gap-3 rounded-3xl p-5">
          <View className="flex-row items-center justify-between">
            <Text className="text-primary-foreground/80 text-xs font-semibold">Your plan</Text>
            {current.renewalCancelled ? (
              <View className="rounded-full bg-white/20 px-2.5 py-1">
                <Text className="text-primary-foreground text-[11px] font-bold">
                  Renewal cancelled
                </Text>
              </View>
            ) : null}
          </View>
          <Text className="text-primary-foreground text-[28px] leading-8 font-extrabold">
            {plan.name}
          </Text>
          <View className="gap-1.5">
            <View className="h-2 overflow-hidden rounded-full bg-white/20">
              <View
                className="bg-primary-foreground h-2 rounded-full"
                style={{
                  width: `${Math.round((left / Math.max(current.includedVisits, 1)) * 100)}%`,
                }}
              />
            </View>
            <Text className="text-primary-foreground/85 text-[13px]">
              {`${left} of ${current.includedVisits} consultations remain · Active until ${formatDay(current.activeUntil)}`}
            </Text>
          </View>
          {current.renewalCancelled ? null : (
            <ActionButton
              variant="outline"
              label="Cancel renewal"
              className="self-start"
              onPress={() =>
                Alert.alert(
                  'Cancel renewal?',
                  `You keep ${plan.name} until ${formatDay(current.activeUntil)}, then it ends.`,
                  [
                    { text: 'Keep it', style: 'cancel' },
                    { text: 'Cancel renewal', style: 'destructive', onPress: cancelRenewal },
                  ]
                )
              }
            />
          )}
        </View>
      ) : null}

      <SegmentedControl
        value={audience}
        onChange={setAudience}
        options={PLAN_AUDIENCES.map(({ value, label }) => ({ value, label }))}
      />

      <View className="gap-3">
        <Text className="text-lg font-extrabold">
          {current ? 'Upgrade your plan' : 'Choose a plan'}
        </Text>
        {tiers.length ? (
          tiers.map((tier, index) => (
            <TierCard
              key={tier.id}
              tier={tier}
              featured={!tier.contact && tiers.length > 1 && index === 0}
              onChoose={setPaying}
            />
          ))
        ) : (
          <View className="bg-card rounded-2xl p-5">
            <Text className="text-muted-foreground text-center text-[13px] leading-5">
              You’re on the best plan for this group. Switch groups above to see other plans.
            </Text>
          </View>
        )}
      </View>

      <Sheet
        open={Boolean(paying)}
        onClose={() => setPaying(null)}
        title="Choose how to pay"
        subtitle={paying ? `${paying.name} · ${paying.priceLabel}` : undefined}>
        {paying ? (
          <>
            <View className="bg-muted gap-2.5 rounded-2xl p-4">
              <View className="flex-row items-center gap-2.5">
                <Icon as={Wallet} className="text-primary size-4.5" />
                <Text className="flex-1 text-[13px] leading-5">
                  Your wallet pays first. A saved card covers anything left.
                </Text>
              </View>
              <View className="flex-row items-baseline justify-between">
                <Text className="text-muted-foreground text-[13px]">Due today</Text>
                <Text className={cn('text-xl font-extrabold')}>
                  {formatNaira((paying.priceNgn ?? 0) * 100)}
                </Text>
              </View>
            </View>
            <View className="flex-row gap-2">
              <ActionButton
                size="md"
                variant="outline"
                label="Cancel"
                className="flex-1"
                onPress={() => setPaying(null)}
              />
              <ActionButton
                size="md"
                label={`Pay ${formatNaira((paying.priceNgn ?? 0) * 100)}`}
                className="flex-[1.6]"
                onPress={() => setPaying(null)}
              />
            </View>
          </>
        ) : null}
      </Sheet>
    </View>
  );
}
