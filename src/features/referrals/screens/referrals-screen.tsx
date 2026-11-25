import { SubScreen } from '@/components/shared/sub-screen';
import { ReferView } from '../components/refer-view';

export function ReferScreen() {
  return (
    <SubScreen title="Refer someone" description="Invite friends and family to NairaClinic.">
      <ReferView />
    </SubScreen>
  );
}
