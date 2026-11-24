import { BodyLayout } from '@/components/common/body-layout';
import { router } from 'expo-router';
import { AppointmentsSection } from '../components/appointments-section';
import { CareTeamStrip } from '../components/care-team-strip';
import { HealthTips } from '../components/health-tips';
import { HomeHeader } from '../components/home-header';
import { QuickActions } from '../components/quick-actions';
import { ReferralCard } from '../components/referral-card';
import { useHome } from '../hooks/use-home';

export function HomeScreen() {
  const home = useHome();
  const { dashboard } = home;

  return (
    <BodyLayout scrollView padding={false} tabBar fixedHeader className="gap-5">
      <HomeHeader firstName={home.firstName} unreadCount={home.unreadCount} />
      <ReferralCard referral={home.referral} />
      <QuickActions
        onRecords={() => router.navigate('/records')}
        onOrder={() => router.navigate('/orders')}
      />
      <CareTeamStrip members={dashboard.careTeam} />
      {dashboard.readyNow.length ? (
        <AppointmentsSection
          title="It's time — join your meeting"
          appointments={dashboard.readyNow}
          ready
        />
      ) : null}
      <AppointmentsSection title="Upcoming" appointments={dashboard.upcoming} />
      <HealthTips tips={dashboard.healthTips} />
    </BodyLayout>
  );
}
