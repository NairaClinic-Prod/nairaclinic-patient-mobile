import { SubScreen } from '@/components/shared/sub-screen';
import { WalletView } from '../components/wallet-view';

export function WalletScreen() {
  return (
    <SubScreen title="Wallet" description="Your balance, and every naira in and out of it.">
      <WalletView />
    </SubScreen>
  );
}
