import { AddButton } from '@/components/patterns/add-button';
import { SegmentedControl } from '@/components/patterns/segmented-control';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { AddTodoSheet } from '@/features/care-plan/components/add-todo-sheet';
import type { ClinicRecordKind } from '@/features/care-plan/components/add-from-clinic';
import { DoneButton } from '@/features/care-plan/components/done-button';
import { MedicationRow } from '@/features/care-plan/components/medication-row';
import { RecordNote, RecordRow } from '@/features/care-plan/components/record-row';
import { ReferralRow } from '@/features/care-plan/components/referral-row';
import { SectionCard } from '@/features/care-plan/components/section-card';
import { TestRow } from '@/features/care-plan/components/test-row';
import { toggleDone, toggleTodo, useCarePlan } from '@/features/care-plan/store';
import { buildTodo, formatDate, todoKey } from '@/features/care-plan/utils';
import { CheckCircle2 } from 'lucide-react-native';
import * as React from 'react';
import { View } from 'react-native';

type TodoViewProps = {
  onAddExternal?: (kind: ClinicRecordKind) => void;
};

export function TodoView({ onAddExternal }: TodoViewProps) {
  const data = useCarePlan();
  const [tab, setTab] = React.useState<'now' | 'done'>('now');
  const [adding, setAdding] = React.useState(false);

  const now = buildTodo(data, false);
  const done = buildTodo(data, true);
  const finished = tab === 'done';
  const shown = finished ? done : now;

  return (
    <View className="gap-4">
      <View className="flex-row items-start justify-between gap-4">
        <View className="min-w-0 flex-1 gap-0.5">
          <Text className="text-lg font-extrabold">What needs your attention</Text>
          <Text className="text-muted-foreground text-xs leading-4.5" numberOfLines={1}>
            Tick off items as you finish them.
          </Text>
        </View>
        <AddButton label="Add to my to-do" onPress={() => setAdding(true)} />
      </View>

      <SegmentedControl
        value={tab}
        onChange={setTab}
        options={[
          { value: 'now', label: 'To do now', count: now.count },
          { value: 'done', label: 'Completed', count: done.count },
        ]}
      />

      {shown.count ? (
        <View className="gap-4">
          {shown.personal.length ? (
            <View className="overflow-hidden rounded-2xl">
              <View className="bg-card/60 px-4 py-3">
                <Text className="text-[15px] font-bold">
                  {'My to-dos '}
                  <Text className="text-muted-foreground text-[15px] font-normal">
                    {shown.personal.length}
                  </Text>
                </Text>
                <Text className="text-muted-foreground text-xs">Things you added for yourself</Text>
              </View>
              <View className="bg-card px-4">
                {shown.personal.map((todo, index) => (
                  <View key={todo.id} className={index ? 'border-border/70 border-t' : ''}>
                    <RecordRow
                      trailingCenter
                      trailing={
                        <DoneButton finished={finished} onPress={() => toggleTodo(todo.id)} />
                      }>
                      <Text className="text-base leading-[22px] font-bold">{todo.title}</Text>
                      <RecordNote>{todo.note || todo.title}</RecordNote>
                    </RecordRow>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {shown.groups.map(({ encounter, meds, tests }) => (
            <View key={encounter.id} className="overflow-hidden rounded-2xl">
              <View className="bg-card/60 px-4 py-3">
                <Text className="text-[15px] font-bold">
                  {`${encounter.title} · ${formatDate(encounter.dateIso)}`}
                </Text>
                <Text className="text-muted-foreground text-xs">
                  {encounter.external
                    ? encounter.clinic || 'External prescriber'
                    : encounter.doctor}
                </Text>
              </View>
              {meds.length ? (
                <SectionCard title="Prescription" count={meds.length}>
                  {meds.map((med) => (
                    <MedicationRow
                      key={med.id}
                      med={med}
                      compact
                      extra={
                        <DoneButton
                          finished={finished}
                          onPress={() => toggleDone(todoKey.med(med))}
                        />
                      }
                    />
                  ))}
                </SectionCard>
              ) : null}
              {tests.length ? (
                <SectionCard title="Lab & diagnostic tests" tone="test" count={tests.length}>
                  {tests.map((test) => (
                    <TestRow
                      key={test.id}
                      test={test}
                      compact
                      extra={
                        test.status === 'resulted' ? null : (
                          <DoneButton
                            finished={finished}
                            onPress={() => toggleDone(todoKey.test(test))}
                          />
                        )
                      }
                    />
                  ))}
                </SectionCard>
              ) : null}
            </View>
          ))}

          {shown.referrals.length ? (
            <View className="overflow-hidden rounded-2xl">
              <SectionCard title="Referrals & specialist care" count={shown.referrals.length}>
                {shown.referrals.map((referral) => (
                  <ReferralRow
                    key={referral.id}
                    referral={referral}
                    extra={
                      <DoneButton
                        finished={finished}
                        onPress={() => toggleDone(todoKey.referral(referral.id))}
                      />
                    }
                  />
                ))}
              </SectionCard>
            </View>
          ) : null}
        </View>
      ) : (
        <View className="border-border items-center gap-2 rounded-2xl border border-dashed py-12">
          <Icon as={CheckCircle2} className="text-primary size-6" />
          <Text className="text-muted-foreground text-sm">
            {finished ? 'Nothing completed yet.' : "You're all caught up."}
          </Text>
        </View>
      )}

      <AddTodoSheet open={adding} onClose={() => setAdding(false)} onPickExternal={onAddExternal} />
    </View>
  );
}
