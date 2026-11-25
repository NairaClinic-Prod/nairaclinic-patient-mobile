import { createStore } from '@/lib/store';
import { DUMMY_COINS, DUMMY_WALLET, DUMMY_WALLET_HISTORY } from './dummy';

const store = createStore({
  wallet: DUMMY_WALLET,
  coins: DUMMY_COINS,
  history: DUMMY_WALLET_HISTORY,
});

export const useWallet = store.use;
