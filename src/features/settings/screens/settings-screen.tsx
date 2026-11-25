import { SubScreen } from '@/components/shared/sub-screen';
import { SettingsView } from '../components/settings-view';

export function SettingsScreen() {
  return (
    <SubScreen title="Settings" description="Security, notifications and how the app looks.">
      <SettingsView />
    </SubScreen>
  );
}
