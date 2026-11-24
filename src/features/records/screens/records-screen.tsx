import { BodyLayout } from '@/components/common/body-layout';
import { ActionButton } from '@/components/patterns/action-button';
import TabHeader from '@/components/common/header';
import { SCREEN_PADDING_X } from '@/constants/ui';
import { AddFromClinic } from '@/features/care-plan/components/add-from-clinic';
import { CareTeamStrip } from '@/features/home/components/care-team-strip';
import { useHome } from '@/features/home/hooks/use-home';
import { Download } from 'lucide-react-native';
import * as React from 'react';
import { View } from 'react-native';
import { CarePlanSection } from '../components/care-plan-section';
import { LabResultsCard } from '../components/lab-results-card';
import { ReadingSheet } from '../components/reading-sheet';
import { ReadingsListSheet } from '../components/readings-list-sheet';
import { VitalsCard } from '../components/vitals-card';
import { RECORDS_SUBTITLE } from '../constants';
import { useVitals } from '../hooks/use-vitals';
import type { Reading, VitalView } from '../types';

const gutter = { paddingHorizontal: SCREEN_PADDING_X };

export function RecordsScreen() {
  const readings = useVitals();
  const { dashboard } = useHome();
  const [kind, setKind] = React.useState<VitalView>('bp');
  const [listOpen, setListOpen] = React.useState(false);
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Reading | null>(null);
  const [dismiss, setDismiss] = React.useState(0);
  const chartTouch = React.useRef(false);

  function openForm(reading: Reading | null, view: VitalView) {
    setKind(view);
    setEditing(reading);
    setListOpen(false);
    setFormOpen(true);
  }

  return (
    <BodyLayout scrollView padding={false} tabBar className="gap-5">
      <View
        className="gap-5"
        onTouchStart={() => {
          if (chartTouch.current) chartTouch.current = false;
          else setDismiss((count) => count + 1);
        }}>
        <TabHeader gutter title="Health records" subtitle={RECORDS_SUBTITLE} />
        <View className="flex-row items-center gap-2" style={gutter}>
          <AddFromClinic className="flex-1" textClassName="text-[13px]" />
          <ActionButton
            size="md"
            label="Download"
            icon={Download}
            variant="outline"
            accessibilityLabel="Download all records"
          />
        </View>

        <View style={gutter}>
          <VitalsCard
            readings={readings}
            dismissSignal={dismiss}
            chartTouch={chartTouch}
            onAdd={(view) => openForm(null, view)}
            onViewAll={(view) => {
              setKind(view);
              setListOpen(true);
            }}
          />
        </View>

        <CareTeamStrip members={dashboard.careTeam} />

        <View className="gap-5" style={gutter}>
          <LabResultsCard />
          <CarePlanSection />
        </View>
      </View>

      <ReadingsListSheet
        open={listOpen}
        kind={kind}
        readings={readings}
        onClose={() => setListOpen(false)}
        onAdd={() => openForm(null, kind)}
        onEdit={(reading) => openForm(reading, reading.kind)}
      />
      <ReadingSheet
        open={formOpen}
        editing={editing}
        defaultKind={kind}
        onClose={() => setFormOpen(false)}
      />
    </BodyLayout>
  );
}
