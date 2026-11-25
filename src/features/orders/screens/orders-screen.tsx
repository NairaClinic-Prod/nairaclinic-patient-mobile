import { FadeIn } from '@/components/shared/fade-in';
import { BodyLayout } from '@/components/common/body-layout';
import TabHeader from '@/components/common/header';
import { SegmentedControl } from '@/components/shared/segmented-control';
import { StatTile } from '@/components/shared/stat-tile';
import { ActionButton } from '@/components/shared/action-button';
import { EmptyState } from '@/components/shared/empty-state';
import { CircleCheck, CloudOff, ShoppingBag, Wallet } from 'lucide-react-native';
import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { OrdersView } from '../components/orders-view';
import { TodoView } from '../components/todo-view';
import { useOrdersData } from '../hooks/use-orders';
import { formatNaira, summarize } from '../utils';

type Tab = 'todo' | 'orders';

export function OrdersScreen() {
  const data = useOrdersData();
  const [tab, setTab] = React.useState<Tab>('todo');
  const stats = summarize(data);

  return (
    <BodyLayout scrollView tabBar className="gap-4" onRefresh={data.refresh}>
      <TabHeader
        title="My to-do & orders"
        subtitle="What to do next from your consultations, plus your pharmacy orders and test bookings."
      />

      {data.loading ? (
        <View className="items-center py-24">
          <ActivityIndicator />
        </View>
      ) : data.failed ? (
        <EmptyState
          icon={CloudOff}
          title="Can't load your orders"
          text="Check your connection and try again."
          action={<ActionButton size="md" label="Try again" onPress={data.refresh} />}
        />
      ) : (
        <Loaded tab={tab} setTab={setTab} stats={stats} />
      )}
    </BodyLayout>
  );
}

function Loaded({
  tab,
  setTab,
  stats,
}: {
  tab: Tab;
  setTab: (tab: Tab) => void;
  stats: ReturnType<typeof summarize>;
}) {
  return (
    <>
      <FadeIn index={0} className="flex-row gap-2.5">
        <StatTile label="In progress" value={stats.inProgress} icon={ShoppingBag} tone="teal" />
        <StatTile
          label="To pay"
          value={stats.toPayCount}
          unit={stats.toPayCount ? formatNaira(stats.toPayKobo) : undefined}
          icon={Wallet}
          tone="warm"
        />
        <StatTile
          label="Ready"
          value={stats.ready}
          unit="to collect"
          icon={CircleCheck}
          tone="mint"
        />
      </FadeIn>

      <FadeIn index={1}>
        <SegmentedControl
          value={tab}
          onChange={setTab}
          options={[
            { value: 'todo', label: 'To-do' },
            { value: 'orders', label: 'Orders', count: stats.activeCount },
          ]}
        />
      </FadeIn>

      <FadeIn key={tab} index={2}>
        {tab === 'todo' ? <TodoView /> : <OrdersView />}
      </FadeIn>
    </>
  );
}
