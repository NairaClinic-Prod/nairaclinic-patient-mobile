import { ActionButton } from '@/components/patterns/action-button';
import { StatusPill } from '@/components/patterns/status-pill';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import {
  BellPlus,
  CalendarDays,
  ChevronDown,
  Download,
  FileText,
  FlaskConical,
  KeyRound,
  Lock,
  Pill,
  ShoppingBag,
  Upload,
  UserRound,
} from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { ISSUED_BY } from '../constants';
import type { CarePlanTab, Encounter } from '../types';
import { formatDate, isOrderable, plural } from '../utils';
import { MedicationRow, type MedicationHandlers } from './medication-row';
import { SectionCard } from './section-card';
import { TestRow, type TestHandlers } from './test-row';

export type EncounterHandlers = MedicationHandlers &
  TestHandlers & {
    onPrescription?: (encounter: Encounter) => void;
    onRemindEncounter?: (encounter: Encounter) => void;
    onTestForm?: (encounter: Encounter) => void;
    onUploadResults?: (encounter: Encounter) => void;
    onLabLink?: (encounter: Encounter) => void;
    onOrderTests?: (encounter: Encounter) => void;
  };

type EncounterAccordionProps = {
  encounters: Encounter[];
  tab: CarePlanTab;
  open: string | null;
  onToggle: (id: string) => void;
  handlers?: EncounterHandlers;
};

export function EncounterAccordion({
  encounters,
  tab,
  open,
  onToggle,
  handlers,
}: EncounterAccordionProps) {
  return (
    <View className="gap-3">
      {encounters.map((encounter) => {
        const expanded = open === encounter.id;
        const orderable = encounter.medications.filter(isOrderable);
        return (
          <View key={encounter.id} className="bg-card overflow-hidden rounded-2xl">
            <Pressable
              role="button"
              accessibilityState={{ expanded }}
              onPress={() => onToggle(encounter.id)}
              className="flex-row items-start gap-3 p-4 active:opacity-70">
              <View className="min-w-0 flex-1 gap-2">
                <View className="flex-row items-center justify-between gap-3">
                  <View className="flex-col items-start gap-1.5 flex-1 min-w-0">
                    <Text className="text-[15px] font-bold leading-5">{encounter.title}</Text>
                    <StatusPill tone={encounter.external ? 'pending' : 'active'}>
                      {encounter.external
                        ? 'External record · Added by you'
                        : 'NairaClinic consultation'}
                    </StatusPill>
                  </View>
                  <View className="border-border size-7 items-center justify-center rounded-full border">
                    <View style={{ transform: [{ rotate: expanded ? '180deg' : '0deg' }] }}>
                      <Icon as={ChevronDown} className="text-muted-foreground size-4" />
                    </View>
                  </View>
                </View>
                <View className="gap-1.5">
                  {/* Encounter reference and doctor */}
                  <View className="flex-row items-center justify-between w-full gap-3">
                    <View className="flex-row items-center gap-1.5 flex-1 min-w-0">
                      <Icon as={CalendarDays} className="text-muted-foreground size-3.5 shrink-0" />
                      <Text className="text-muted-foreground text-xs flex-1" numberOfLines={1}>
                        {`#${encounter.ref} · ${formatDate(encounter.dateIso)}`}
                      </Text>
                    </View>

                    {/* Doctor/clinic */}
                    <View className="flex-row items-center gap-1.5 flex-1 min-w-0 justify-end">
                      <Icon as={UserRound} className="text-muted-foreground size-3.5 shrink-0" />
                      <Text
                        className="text-muted-foreground shrink text-xs"
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {encounter.external
                          ? encounter.clinic || 'External prescriber'
                          : encounter.doctor}
                      </Text>
                    </View>
                  </View>

                  {/* Medications and tests */}
                  <View className="flex-row justify-between items-center w-full">
                    {encounter.medications.length > 0 ? (
                      <View className="flex-row items-center gap-1.5">
                        <Icon as={Pill} className="text-muted-foreground size-3.5" />
                        <Text className="text-muted-foreground text-xs">
                          {plural(encounter.medications.length, 'medication')}
                        </Text>
                      </View>
                    ) : <View />}

                    {encounter.tests.length > 0 ? (
                      <View className="flex-row items-center gap-1.5">
                        <Icon as={FlaskConical} className="text-muted-foreground size-3.5" />
                        <Text className="text-muted-foreground text-xs">
                          {plural(encounter.tests.length, 'test')}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              </View>
            </Pressable>

            {expanded ? (
              <View className="border-border border-t">
                {tab !== 'test' && encounter.medications.length ? (
                  <SectionCard
                    title="Prescription"
                    count={encounter.medications.length}
                    actions={
                      <>
                        <ActionButton
                          label="Order medicines"
                          icon={ShoppingBag}
                          disabled={!orderable.length}
                          onPress={() => handlers?.onOrder?.(orderable)}
                        />
                        <ActionButton
                          label="Prescription"
                          icon={FileText}
                          variant="outline"
                          onPress={() => handlers?.onPrescription?.(encounter)}
                        />
                        <ActionButton
                          label="Set reminders"
                          icon={BellPlus}
                          variant="outline"
                          onPress={() => handlers?.onRemindEncounter?.(encounter)}
                        />
                      </>
                    }>
                    {encounter.medications.map((med) => (
                      <MedicationRow key={med.id} med={med} handlers={handlers} />
                    ))}
                  </SectionCard>
                ) : null}
                {tab !== 'medication' && encounter.tests.length ? (
                  <SectionCard
                    title="Lab & diagnostic tests"
                    tone="test"
                    count={encounter.tests.length}
                    actions={
                      <>
                        <ActionButton
                          label="Order tests"
                          icon={ShoppingBag}
                          onPress={() => handlers?.onOrderTests?.(encounter)}
                        />
                        <ActionButton
                          label="Download test form"
                          icon={Download}
                          variant="outline"
                          onPress={() => handlers?.onTestForm?.(encounter)}
                        />
                        <ActionButton
                          label="Upload results"
                          icon={Upload}
                          variant="outline"
                          onPress={() => handlers?.onUploadResults?.(encounter)}
                        />
                        <ActionButton
                          label="Lab upload link"
                          icon={KeyRound}
                          variant="outline"
                          onPress={() => handlers?.onLabLink?.(encounter)}
                        />
                      </>
                    }>
                    {encounter.tests.map((test) => (
                      <TestRow key={test.id} test={test} handlers={handlers} />
                    ))}
                  </SectionCard>
                ) : null}
                <View className="border-border flex-row items-center gap-1.5 border-t px-4 py-3">
                  <Icon as={Lock} className="text-muted-foreground size-3.5" />
                  <Text className="text-muted-foreground flex-1 text-xs">
                    {encounter.external
                      ? `Added by you${encounter.clinic ? ` · ${encounter.clinic}` : ''}`
                      : `${ISSUED_BY[tab]} ${encounter.doctor} · Consultation #${encounter.ref}`}
                  </Text>
                </View>
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}
