import { BodyLayout } from '@/components/common/body-layout';
import TabHeader from '@/components/common/header';
import { SegmentedControl } from '@/components/patterns/segmented-control';
import { StatTile } from '@/components/patterns/stat-tile';
import { CircleCheck, ShoppingBag, Wallet } from 'lucide-react-native';
import * as React from 'react';
import { View } from 'react-native';
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
    <BodyLayout scrollView tabBar className="gap-4">
      <TabHeader
        title="My to-do & orders"
        subtitle="What to do next from your consultations, plus your pharmacy orders and test bookings."
      />

      <View className="flex-row gap-2.5">
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
      </View>

      <SegmentedControl
        value={tab}
        onChange={setTab}
        options={[
          { value: 'todo', label: 'To-do' },
          { value: 'orders', label: 'Orders', count: stats.activeCount },
        ]}
      />

      {tab === 'todo' ? <TodoView /> : <OrdersView />}
    </BodyLayout>
  );
}
