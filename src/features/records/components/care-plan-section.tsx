import { ActionButton } from '@/components/shared/action-button';
import { ChipTabs } from '@/components/shared/chip-tabs';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { CARE_PLAN_TABS } from '@/features/care-plan/constants';
import {
  EncounterAccordion,
  type EncounterHandlers,
} from '@/features/care-plan/components/encounter-accordion';
import { ReferralRow } from '@/features/care-plan/components/referral-row';
import { SectionCard } from '@/features/care-plan/components/section-card';
import { useCarePlan } from '@/features/care-plan/store';
import type { CarePlanTab } from '@/features/care-plan/types';
import { defaultOpenEncounter } from '@/features/care-plan/utils';
import { ChevronsDownUp, Download, Layers } from 'lucide-react-native';
import * as React from 'react';
import { View } from 'react-native';

const EMPTY: Record<Exclude<CarePlanTab, 'all'>, string> = {
  test: 'No lab orders on record.',
  medication: 'No prescriptions on record.',
  referral: 'No referrals on record.',
};

type CarePlanSectionProps = { handlers?: EncounterHandlers; onSummary?: () => void };

export function CarePlanSection({ handlers, onSummary }: CarePlanSectionProps) {
  const { encounters, referrals } = useCarePlan();
  const [tab, setTab] = React.useState<CarePlanTab>('all');
  const [open, setOpen] = React.useState<string | null | undefined>(undefined);

  const withMeds = encounters.filter((encounter) => encounter.medications.length);
  const withTests = encounters.filter((encounter) => encounter.tests.length);
  const counts = {
    medication: withMeds.reduce((sum, encounter) => sum + encounter.medications.length, 0),
    test: withTests.reduce((sum, encounter) => sum + encounter.tests.length, 0),
    referral: referrals.length,
  };

  const visible =
    tab === 'medication'
      ? withMeds
      : tab === 'test'
        ? withTests
        : tab === 'referral'
          ? []
          : encounters;
  const openId = open === undefined ? defaultOpenEncounter(visible) : open;
  const showReferrals = (tab === 'all' || tab === 'referral') && referrals.length > 0;

  return (
    <View className="gap-3">
      <ChipTabs
        value={tab}
        onChange={(next) => {
          setTab(next);
          setOpen(undefined);
        }}
        options={CARE_PLAN_TABS.map(({ value, label }) => ({
          value,
          label,
          count:
            value === 'all' ? counts.medication + counts.test + counts.referral : counts[value],
        }))}
      />

      {visible.length ? (
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-1.5">
            <Icon as={Layers} className="text-muted-foreground size-3.5" />
            <Text className="text-muted-foreground text-xs">By consultation</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <ActionButton label="Summary" icon={Download} variant="ghost" onPress={onSummary} />
            {/* <ActionButton
              label="Collapse all"
              icon={ChevronsDownUp}
              variant="ghost"
              disabled={!openId}
              onPress={() => setOpen(null)}
            /> */}
          </View>
        </View>
      ) : null}

      {visible.length ? (
        <EncounterAccordion
          encounters={visible}
          tab={tab}
          open={openId}
          onToggle={(id) => setOpen(openId === id ? null : id)}
          handlers={handlers}
        />
      ) : tab !== 'all' && tab !== 'referral' ? (
        <Empty text={EMPTY[tab]} />
      ) : null}

      {showReferrals ? (
        <View className="overflow-hidden rounded-2xl">
          <SectionCard title="Referrals & specialist care" count={referrals.length}>
            {referrals.map((referral) => (
              <ReferralRow key={referral.id} referral={referral} />
            ))}
          </SectionCard>
        </View>
      ) : tab === 'referral' ? (
        <Empty text={EMPTY.referral} />
      ) : null}
    </View>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <View className="border-border items-center rounded-2xl border border-dashed px-4 py-10">
      <Text className="text-muted-foreground text-center text-sm">{text}</Text>
    </View>
  );
}
