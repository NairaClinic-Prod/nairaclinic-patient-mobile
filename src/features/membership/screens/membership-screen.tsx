import { SubScreen } from '@/components/shared/sub-screen';
import { MembershipView } from '../components/membership-view';

export function MembershipScreen() {
  return (
    <SubScreen
      title="Membership"
      description="Straightforward plans for you, your household, or your team.">
      <MembershipView />
    </SubScreen>
  );
}
