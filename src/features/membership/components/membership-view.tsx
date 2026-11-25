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
import { TIERS } from '../dummy';
import { cancelRenewal, useMembership } from '../store';
import type { MembershipTier, PlanAudience } from '../types';

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
    <View className="gap-3 rounded-2xl bg-card p-4">
      <View className="flex-row items-center justify-between">
        <View className="size-9 items-center justify-center rounded-lg bg-secondary">
          <Icon as={HeartPulse} className="size-4.5 text-primary" />
        </View>
        {featured ? (
          <View className="rounded-full bg-primary px-2.5 py-1">
            <Text className="text-[11px] font-bold text-primary-foreground">Recommended</Text>
          </View>
        ) : null}
      </View>
      <View className="gap-1">
        <Text className="text-lg font-extrabold">{tier.name}</Text>
        <Text className="text-[13px] leading-5 text-muted-foreground">{tier.description}</Text>
      </View>
      <Text className="text-2xl font-extrabold tracking-tight">{tier.priceLabel}</Text>
      <View className="gap-2">
        {tier.benefits.map((benefit) => (
          <View key={benefit} className="flex-row items-start gap-2.5">
            <Icon as={Check} className="mt-0.5 size-4 text-success" />
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
  const { current } = useMembership();
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
        <View className="gap-3 rounded-3xl bg-primary p-5">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-semibold text-primary-foreground/80">Your plan</Text>
            {current.renewalCancelled ? (
              <View className="rounded-full bg-white/20 px-2.5 py-1">
                <Text className="text-[11px] font-bold text-primary-foreground">
                  Renewal cancelled
                </Text>
              </View>
            ) : null}
          </View>
          <Text className="text-[28px] leading-8 font-extrabold text-primary-foreground">
            {plan.name}
          </Text>
          <View className="gap-1.5">
            <View className="h-2 overflow-hidden rounded-full bg-white/20">
              <View
                className="h-2 rounded-full bg-primary-foreground"
                style={{
                  width: `${Math.round((left / Math.max(current.includedVisits, 1)) * 100)}%`,
                }}
              />
            </View>
            <Text className="text-[13px] text-primary-foreground/85">
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
          <View className="rounded-2xl bg-card p-5">
            <Text className="text-center text-[13px] leading-5 text-muted-foreground">
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
            <View className="gap-2.5 rounded-2xl bg-muted p-4">
              <View className="flex-row items-center gap-2.5">
                <Icon as={Wallet} className="size-4.5 text-primary" />
                <Text className="flex-1 text-[13px] leading-5">
                  Your wallet pays first. A saved card covers anything left.
                </Text>
              </View>
              <View className="flex-row items-baseline justify-between">
                <Text className="text-[13px] text-muted-foreground">Due today</Text>
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
