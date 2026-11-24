import { ActionButton } from '@/components/patterns/action-button';
import { StatusPill } from '@/components/patterns/status-pill';
import { Text } from '@/components/ui/text';
import { Download, Search, Share2 } from 'lucide-react-native';
import type * as React from 'react';
import { View } from 'react-native';
import type { CareReferral } from '../types';
import { formatDate } from '../utils';
import { FactGrid, RecordNote, RecordRow } from './record-row';

type ReferralRowProps = {
  referral: CareReferral;
  extra?: React.ReactNode;
  onFindSpecialist?: (referral: CareReferral) => void;
  onLetter?: (referral: CareReferral) => void;
};

export function ReferralRow({ referral, extra, onFindSpecialist, onLetter }: ReferralRowProps) {
  return (
    <RecordRow
      trailing={extra}
      // icon={Share2}
      actions={
        <>
          {referral.onPlatform ? (
            <ActionButton
              label="Find a specialist"
              icon={Search}
              onPress={() => onFindSpecialist?.(referral)}
            />
          ) : null}
          <ActionButton
            label="Referral letter"
            icon={Download}
            variant="outline"
            onPress={() => onLetter?.(referral)}
          />
        </>
      }>
      <View className="gap-1.5">
        <Text className="text-base leading-5.5 font-bold">{referral.title}</Text>
        <StatusPill tone={referral.onPlatform ? 'active' : 'info'}>
          {referral.onPlatform ? 'On NairaClinic' : 'Outside NairaClinic'}
        </StatusPill>
      </View>
      <FactGrid
        facts={[
          {
            label: 'Referred to',
            value: referral.onPlatform
              ? 'A specialist on NairaClinic'
              : referral.hospital || 'A specialist outside NairaClinic',
          },
          { label: 'Referred on', value: formatDate(referral.dateIso) },
        ]}
      />
      {referral.reason ? <RecordNote>{referral.reason}</RecordNote> : null}
    </RecordRow>
  );
}
