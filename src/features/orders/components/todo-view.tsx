import { AddButton } from '@/components/shared/add-button';
import { InlineSelect } from '@/components/shared/inline-select';
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
import {
  buildTodo,
  formatDate,
  isDone,
  todoKey,
  type TodoFilter,
} from '@/features/care-plan/utils';
import { CheckCircle2 } from 'lucide-react-native';
import { ITEM_ENTER, ITEM_EXIT, LIST_LAYOUT } from '@/lib/motion';
import * as React from 'react';
import Animated from 'react-native-reanimated';
import { View } from 'react-native';

const FILTER_LABEL: Record<TodoFilter, string> = { now: 'To do', done: 'Completed', all: 'All' };

type TodoViewProps = {
  onAddExternal?: (kind: ClinicRecordKind) => void;
};

export function TodoView({ onAddExternal }: TodoViewProps) {
  const data = useCarePlan();
  const [filter, setFilter] = React.useState<TodoFilter>('now');
  const [adding, setAdding] = React.useState(false);

  const now = buildTodo(data, 'now');
  const done = buildTodo(data, 'done');
  const shown = buildTodo(data, filter);
  const state = isDone(data);
  const empty =
    filter === 'done'
      ? 'Nothing completed yet.'
      : filter === 'all'
        ? 'Nothing here yet. Add something to your to-do.'
        : "You're all caught up.";

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

      <View className="flex-row items-center justify-between gap-3">
        <Text className="text-muted-foreground text-xs">
          <Text className="text-foreground text-xs font-bold">{now.count}</Text>
          {' to do · '}
          <Text className="text-foreground text-xs font-bold">{done.count}</Text>
          {' completed'}
        </Text>
        <InlineSelect<TodoFilter>
          title="Show"
          value={filter}
          options={[
            { value: 'now', label: FILTER_LABEL.now },
            { value: 'done', label: FILTER_LABEL.done },
            { value: 'all', label: FILTER_LABEL.all },
          ]}
          onChange={setFilter}
        />
      </View>

      {shown.count ? (
        <Animated.View key={filter} entering={ITEM_ENTER} className="gap-4">
          {shown.personal.length ? (
            <Animated.View
              layout={LIST_LAYOUT}
              entering={ITEM_ENTER}
              exiting={ITEM_EXIT}
              className="overflow-hidden rounded-2xl">
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
                  <Animated.View
                    key={todo.id}
                    layout={LIST_LAYOUT}
                    entering={ITEM_ENTER}
                    exiting={ITEM_EXIT}
                    className={index ? 'border-border/70 border-t' : ''}>
                    <RecordRow
                      trailingCenter
                      trailing={
                        <DoneButton finished={todo.done} onPress={() => toggleTodo(todo.id)} />
                      }>
                      <Text className="text-base leading-5.5 font-bold">{todo.title}</Text>
                      <RecordNote>{todo.note || todo.title}</RecordNote>
                    </RecordRow>
                  </Animated.View>
                ))}
              </View>
            </Animated.View>
          ) : null}

          {shown.groups.map(({ encounter, meds, tests }) => (
            <Animated.View
              key={encounter.id}
              layout={LIST_LAYOUT}
              entering={ITEM_ENTER}
              exiting={ITEM_EXIT}
              className="overflow-hidden rounded-2xl">
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
                          finished={state.med(med)}
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
                            finished={state.test(test)}
                            onPress={() => toggleDone(todoKey.test(test))}
                          />
                        )
                      }
                    />
                  ))}
                </SectionCard>
              ) : null}
            </Animated.View>
          ))}

          {shown.referrals.length ? (
            <Animated.View
              layout={LIST_LAYOUT}
              entering={ITEM_ENTER}
              exiting={ITEM_EXIT}
              className="overflow-hidden rounded-2xl">
              <SectionCard title="Referrals & specialist care" count={shown.referrals.length}>
                {shown.referrals.map((referral) => (
                  <ReferralRow
                    key={referral.id}
                    referral={referral}
                    extra={
                      <DoneButton
                        finished={state.referral(referral.id)}
                        onPress={() => toggleDone(todoKey.referral(referral.id))}
                      />
                    }
                  />
                ))}
              </SectionCard>
            </Animated.View>
          ) : null}
        </Animated.View>
      ) : (
        <Animated.View
          entering={ITEM_ENTER}
          className="border-border items-center gap-2 rounded-2xl border border-dashed py-12">
          <Icon as={CheckCircle2} className="text-primary size-6" />
          <Text className="text-muted-foreground text-sm">{empty}</Text>
        </Animated.View>
      )}

      <AddTodoSheet open={adding} onClose={() => setAdding(false)} onPickExternal={onAddExternal} />
    </View>
  );
}
