import { SubScreen } from '@/components/shared/sub-screen';
import { LabTestsView } from '../components/lab-tests-view';

export function LabTestsScreen() {
  return (
    <SubScreen
      title="Lab tests"
      description="Book tests at verified laboratories, pay once, and get results on your record.">
      <LabTestsView />
    </SubScreen>
  );
}
