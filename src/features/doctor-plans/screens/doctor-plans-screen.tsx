import { SubScreen } from '@/components/shared/sub-screen';
import { DoctorPlansView } from '../components/doctor-plans-view';

export function DoctorPlansScreen() {
  return (
    <SubScreen
      title="My doctor plans"
      description="Monthly plans you hold with your doctors and the visits left this month.">
      <DoctorPlansView />
    </SubScreen>
  );
}
