import { SubScreen } from '@/components/shared/sub-screen';
import { TransactionsView } from '../components/transactions-view';

export function TransactionsScreen() {
  return (
    <SubScreen
      title="Transactions"
      description="Consultations, pharmacy orders and plans you've paid for. Unpaid bookings never appear here.">
      <TransactionsView />
    </SubScreen>
  );
}
