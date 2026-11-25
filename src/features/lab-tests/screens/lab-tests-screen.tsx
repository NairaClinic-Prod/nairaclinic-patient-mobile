import { refreshLabs } from '@/api/labs';
import { BodyLayout } from '@/components/common/body-layout';
import TabHeader from '@/components/common/header';
import { FadeIn } from '@/components/shared/fade-in';
import { LabTestsView } from '../components/lab-tests-view';

// A main tab, so it uses the tab page header (no back button) and sits above the tab bar.
export function LabTestsScreen() {
  return (
    <BodyLayout scrollView tabBar className="gap-4" onRefresh={refreshLabs}>
      <TabHeader
        title="Lab tests"
        subtitle="Book tests at verified laboratories, pay once, and get results on your record."
      />
      <FadeIn index={1}>
        <LabTestsView />
      </FadeIn>
    </BodyLayout>
  );
}
