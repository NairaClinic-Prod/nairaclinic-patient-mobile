import { SubScreen } from '@/components/shared/sub-screen';
import { SecurityView } from '../components/security-view';

export function SecurityScreen() {
  return (
    <SubScreen
      title="Privacy & security"
      description="Your medical records remain private and access-controlled.">
      <SecurityView />
    </SubScreen>
  );
}
