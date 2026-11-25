import { SubScreen } from '@/components/shared/sub-screen';
import { NotificationsView } from '../components/notifications-view';

export function NotificationsScreen() {
  return (
    <SubScreen title="Notifications" description="Updates, reminders, and follow-through.">
      <NotificationsView />
    </SubScreen>
  );
}
