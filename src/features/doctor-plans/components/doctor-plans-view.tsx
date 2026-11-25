import { ActionButton } from '@/components/shared/action-button';
import { EmptyState } from '@/components/shared/empty-state';
import { StatusPill } from '@/components/shared/status-pill';
import { Text } from '@/components/ui/text';
import { formatDay, formatNaira } from '@/features/orders/utils';
import { Stethoscope } from 'lucide-react-native';
import { Alert, View } from 'react-native';
import { turnOffAutoRenew, useDoctorPlans } from '../store';

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between gap-3">
      <Text className="text-muted-foreground text-[13px]">{label}</Text>
      <Text className="min-w-0 flex-1 text-right text-[13px] font-medium">{value}</Text>
    </View>
  );
}

export function DoctorPlansView() {
  const { plans } = useDoctorPlans();

  if (!plans.length) {
    return (
      <View className="bg-card rounded-2xl">
        <EmptyState
          icon={Stethoscope}
          title="You don’t have any doctor plans."
          text="Doctors who offer monthly plans show them on their booking page under “Subscription plans”."
        />
      </View>
    );
  }

  return (
    <View className="gap-4">
      {plans.map((plan) => (
        <View key={plan.id} className="bg-card gap-4 rounded-2xl p-4">
          <View className="flex-row items-start justify-between gap-3">
            <View className="min-w-0 flex-1 gap-0.5">
              <Text className="text-muted-foreground text-xs">{plan.doctor}</Text>
              <Text className="text-[17px] leading-6 font-extrabold">{plan.name}</Text>
            </View>
            <StatusPill tone={plan.status === 'active' ? 'active' : 'pending'}>
              {plan.status === 'lapsed'
                ? 'Renewal due'
                : plan.status === 'ending'
                  ? `Ends ${formatDay(plan.periodEnd)}`
                  : 'Active'}
            </StatusPill>
          </View>

          <View className="gap-2">
            {plan.remaining.map((row) => (
              <View key={row.label} className="bg-muted rounded-xl px-3.5 py-2.5">
                <Text className="text-[13px]">{row.label}</Text>
                <Text className="text-muted-foreground text-xs">
                  <Text className="text-foreground text-xs font-bold">{row.remaining}</Text>
                  {` of ${row.count} left this period`}
                </Text>
              </View>
            ))}
          </View>

          <View className="gap-1.5">
            <Fact label="Period ends" value={formatDay(plan.periodEnd)} />
            <Fact
              label="Next charge"
              value={
                plan.nextChargeKobo !== null
                  ? `${formatNaira(plan.nextChargeKobo)} on ${formatDay(plan.periodEnd)}`
                  : 'None (won’t renew)'
              }
            />
            {plan.card ? <Fact label="Card" value={plan.card} /> : null}
          </View>

          <View className="gap-2">
            <ActionButton
              size="md"
              label={plan.status === 'lapsed' ? 'Subscribe again' : 'Book an included visit'}
            />
            {plan.status === 'active' ? (
              <ActionButton
                size="md"
                variant="danger"
                label="Turn off auto renew"
                onPress={() =>
                  Alert.alert(
                    'Turn off auto renew?',
                    `You keep your remaining visits until ${formatDay(plan.periodEnd)}, then the plan ends. You won’t be charged again, and there’s no refund for this month.`,
                    [
                      { text: 'Keep it on', style: 'cancel' },
                      {
                        text: 'Turn off',
                        style: 'destructive',
                        onPress: () => turnOffAutoRenew(plan.id),
                      },
                    ]
                  )
                }
              />
            ) : null}
          </View>
        </View>
      ))}
    </View>
  );
}
