import { pdfKeys } from '../documents';
import { PdfButton } from './pdf-button';
import { openMakeOrder } from '@/features/make-order/store';
import { ActionButton } from '@/components/shared/action-button';
import { StatusPill } from '@/components/shared/status-pill';
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
import { ITEM_ENTER, ITEM_EXIT, LIST_LAYOUT } from '@/lib/motion';
import * as React from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { ISSUED_BY } from '../constants';
import type { CarePlanTab, Encounter } from '../types';
import { formatDate, isOrderable, plural } from '../utils';
import { MedicationRow, type MedicationHandlers } from './medication-row';
import { SectionCard } from './section-card';
import { TestRow, type TestHandlers } from './test-row';

const TURN = {
  damping: 30,
  stiffness: 260,
  mass: 0.7,
  overshootClamping: true,
  reduceMotion: ReduceMotion.System,
};

function Chevron({ expanded }: { expanded: boolean }) {
  const turn = useSharedValue(expanded ? 1 : 0);

  React.useEffect(() => {
    turn.set(withSpring(expanded ? 1 : 0, TURN));
  }, [expanded, turn]);

  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${turn.get() * 180}deg` }] }));

  return (
    <Animated.View style={style}>
      <Icon as={ChevronDown} className="size-4 text-muted-foreground" />
    </Animated.View>
  );
}

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
    <View className="gap-4">
      {encounters.map((encounter) => {
        const expanded = open === encounter.id;
        const orderable = encounter.medications.filter(isOrderable);
        return (
          <Animated.View
            key={encounter.id}
            layout={LIST_LAYOUT}
            className="overflow-hidden rounded-2xl border border-border bg-card">
            <Pressable
              role="button"
              accessibilityState={{ expanded }}
              onPress={() => onToggle(encounter.id)}
              className="flex-row items-start gap-3 p-5 active:opacity-70">
              <View className="min-w-0 flex-1 gap-2">
                <View className="flex-row items-center justify-between gap-3">
                  <View className="min-w-0 flex-1 flex-col items-start gap-1.5">
                    <Text className="text-[15px] leading-5 font-bold">{encounter.title}</Text>
                    <StatusPill tone={encounter.external ? 'pending' : 'active'}>
                      {encounter.external
                        ? 'External record · Added by you'
                        : 'NairaClinic consultation'}
                    </StatusPill>
                  </View>
                  <View className="size-7 items-center justify-center rounded-full border border-border">
                    <Chevron expanded={expanded} />
                  </View>
                </View>
                <View className="gap-1.5">
                  {/* Encounter reference and doctor */}
                  <View className="w-full flex-row items-center justify-between gap-3">
                    <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
                      <Icon as={CalendarDays} className="size-3.5 shrink-0 text-muted-foreground" />
                      <Text className="flex-1 text-xs text-muted-foreground" numberOfLines={1}>
                        {`${formatDate(encounter.dateIso)}`}
                      </Text>
                    </View>

                    {/* Doctor/clinic */}
                    <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
                      <Icon as={UserRound} className="size-3.5 shrink-0 text-muted-foreground" />
                      <Text
                        className="shrink text-xs text-muted-foreground"
                        numberOfLines={1}
                        ellipsizeMode="tail">
                        {encounter.external
                          ? encounter.clinic || 'External prescriber'
                          : encounter.doctor}
                      </Text>
                    </View>
                  </View>

                  {/* Medications and tests */}
                  <View className="w-full flex-row items-center gap-3">
                    {encounter.medications.length > 0 ? (
                      <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
                        <Icon as={Pill} className="size-3.5 text-muted-foreground" />
                        <Text className="text-xs text-muted-foreground">
                          {plural(encounter.medications.length, 'medication')}
                        </Text>
                      </View>
                    ) : null}

                    {encounter.tests.length > 0 ? (
                      <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
                        <Icon as={FlaskConical} className="size-3.5 text-muted-foreground" />
                        <Text className="text-xs text-muted-foreground">
                          {plural(encounter.tests.length, 'test')}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              </View>
            </Pressable>

            {expanded ? (
              <Animated.View
                entering={ITEM_ENTER}
                exiting={ITEM_EXIT}
                className="border-t border-border">
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
                          onPress={() =>
                            handlers?.onOrder
                              ? handlers.onOrder(orderable)
                              : openMakeOrder({
                                  kind: 'medication',
                                  sourceId: encounter.id,
                                  names: orderable.map((med) =>
                                    [med.name, med.strength].filter(Boolean).join(' ')
                                  ),
                                })
                          }
                        />
                        <PdfButton
                          pdfKey={pdfKeys.prescription(encounter.id)}
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
                          onPress={() =>
                            handlers?.onOrderTests
                              ? handlers.onOrderTests(encounter)
                              : openMakeOrder({ kind: 'lab', sourceId: encounter.id })
                          }
                        />
                        <PdfButton
                          pdfKey={pdfKeys.tests(encounter.id)}
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
                <View className="flex-row items-center gap-1.5 border-t border-border px-4 py-3">
                  <Icon as={Lock} className="size-3.5 text-muted-foreground" />
                  <Text className="flex-1 text-xs text-muted-foreground">
                    {encounter.external
                      ? `Added by you${encounter.clinic ? ` · ${encounter.clinic}` : ''}`
                      : `${ISSUED_BY[tab]} ${encounter.doctor} · Consultation #${encounter.ref}`}
                  </Text>
                </View>
              </Animated.View>
            ) : null}
          </Animated.View>
        );
      })}
    </View>
  );
}
