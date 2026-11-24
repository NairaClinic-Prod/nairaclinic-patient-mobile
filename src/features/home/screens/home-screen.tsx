import { FadeIn } from '@/components/patterns/fade-in';
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
      <FadeIn index={0}>
        <ReferralCard referral={home.referral} />
      </FadeIn>
      <FadeIn index={1}>
        <QuickActions
          onRecords={() => router.navigate('/records')}
          onOrder={() => router.navigate('/orders')}
        />
      </FadeIn>
      <FadeIn index={2}>
        <CareTeamStrip members={dashboard.careTeam} />
      </FadeIn>
      {dashboard.readyNow.length ? (
        <FadeIn index={3}>
          <AppointmentsSection
            title="It's time — join your meeting"
            appointments={dashboard.readyNow}
            ready
          />
        </FadeIn>
      ) : null}
      <FadeIn index={4}>
        <AppointmentsSection title="Upcoming" appointments={dashboard.upcoming} />
      </FadeIn>
      <FadeIn index={5}>
        <HealthTips tips={dashboard.healthTips} />
      </FadeIn>
    </BodyLayout>
  );
}
