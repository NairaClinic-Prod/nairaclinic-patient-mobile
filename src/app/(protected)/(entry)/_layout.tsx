import { FloatingTabBar } from '@/components/layout/floating-tab-bar';
import { Tabs } from 'expo-router/js-tabs';

export default function EntryLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{ headerShown: false, animation: 'fade', freezeOnBlur: true }}>
      <Tabs.Screen name="home" />
      <Tabs.Screen name="records" />
      <Tabs.Screen name="orders" />
      <Tabs.Screen name="reminders" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
