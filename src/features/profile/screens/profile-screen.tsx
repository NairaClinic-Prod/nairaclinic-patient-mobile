import { BodyLayout } from '@/components/common/body-layout';
import { ActionButton } from '@/components/shared/action-button';
import { confirmSignOut } from '@/features/auth/sign-out-confirm';
import TabHeader from '@/components/common/header';
import { EmptyState } from '@/components/shared/empty-state';
import { FadeIn } from '@/components/shared/fade-in';
import { PressableScale } from '@/components/shared/pressable-scale';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { router, type Href } from 'expo-router';
import {
  Bell,
  AlarmClock,
  CloudOff,
  CreditCard,
  Gift,
  HeartHandshake,
  HeartPulse,
  IdCard,
  LogOut,
  Receipt,
  Settings,
  Stethoscope,
  User,
  Wallet,
} from 'lucide-react-native';
import { ActivityIndicator, View } from 'react-native';
import { MenuList } from '../components/menu-list';
import { CompletionCard } from '../components/profile-summary';
import { ProfileHero } from '../components/profile-hero';
import { WalletCard } from '@/features/wallet/components/wallet-card';
import { useWallet } from '@/features/wallet/store';
import { useUnreadCount } from '@/features/notifications/store';
import { ageOf, completion, fullName, useProfile } from '../hooks/use-profile';
import { usePhoto } from '../hooks/use-photo';
import type { ProfileDetailSection } from '../types';

const open = (path: Href) => router.push(path);
const details = (section: ProfileDetailSection) => router.push(`/details/${section}`);

export function ProfileScreen() {
  const { profile, isPending, isError, refetch } = useProfile();
  const { wallet } = useWallet();
  const photo = usePhoto();
  const unread = useUnreadCount();
  const progress = completion(profile, Boolean(photo));
  const age = ageOf(profile.dob);
  const personalSummary = profile.email || profile.phone || 'Complete your personal details';
  const healthSummary =
    [profile.bloodGroup, profile.genotype].filter(Boolean).join(' · ') || 'Add your health details';

  return (
    <BodyLayout scrollView tabBar className="gap-5">
      <TabHeader
        title="Profile"
        right={
          <PressableScale
            scaleTo={0.92}
            role="button"
            accessibilityLabel="Settings"
            onPress={() => open('/settings')}
            className="size-11 items-center justify-center rounded-full bg-card">
            <Icon as={Settings} className="size-5 text-foreground" />
          </PressableScale>
        }
      />

      {isPending ? (
        <View className="items-center py-24">
          <ActivityIndicator />
        </View>
      ) : isError ? (
        <View className="rounded-2xl bg-card">
          <EmptyState
            icon={CloudOff}
            title="Couldn't load your profile"
            text="Check your connection and try again."
            action={<ActionButton size="md" label="Try again" onPress={() => refetch()} />}
          />
        </View>
      ) : (
        <>
          <FadeIn index={0}>
            <ProfileHero
              name={fullName(profile) || 'Your profile'}
              detail={[age === null ? '' : `${age} years`, profile.sexAtBirth]
                .filter(Boolean)
                .join(' · ')}
              contact={profile.email || profile.phone || 'Complete your personal details'}
            />
          </FadeIn>

          {progress.percent < 100 ? (
            <FadeIn index={1}>
              <CompletionCard
                percent={progress.percent}
                missing={progress.missing}
                onComplete={() =>
                  details(progress.missing.includes('A profile photo') ? 'personal' : 'health')
                }
              />
            </FadeIn>
          ) : null}

          <FadeIn index={2}>
            <WalletCard wallet={wallet} onPress={() => open('/wallet')} />
          </FadeIn>

          <FadeIn index={3}>
            <MenuList
              items={[
                {
                  key: 'personal',
                  title: 'Personal information',
                  text: personalSummary,
                  icon: User,
                  onPress: () => details('personal'),
                },
                {
                  key: 'health',
                  title: 'Health snapshot',
                  text: healthSummary,
                  icon: HeartPulse,
                  onPress: () => details('health'),
                },
              ]}
            />
          </FadeIn>

          <FadeIn index={4} className="gap-5">
            <View className="gap-3">
              <Text className="text-lg font-extrabold">Care</Text>
              <MenuList
                items={[
                  {
                    key: 'reminders',
                    title: 'Reminders',
                    text: 'Medicine, test and care reminders',
                    icon: AlarmClock,
                    onPress: () => open('/reminders'),
                  },
                  {
                    key: 'membership',
                    title: 'Membership',
                    text: 'Your plan and what it includes',
                    icon: IdCard,
                    onPress: () => open('/membership'),
                  },
                  {
                    key: 'doctor-plans',
                    title: '',
                    text: '',
                    icon: Stethoscope,
                    onPress: () => open('/doctor-plans'),
                  },
                ]}
              />
            </View>

            <View className="gap-3">
              <Text className="text-lg font-extrabold">Money and rewards</Text>
              <MenuList
                items={[
                  {
                    key: 'wallet',
                    title: 'Wallet',
                    text: 'Balance and every naira in and out',
                    icon: Wallet,
                    onPress: () => open('/wallet'),
                  },
                  {
                    key: 'payment-methods',
                    title: 'Payment methods',
                    text: 'Your saved cards',
                    icon: CreditCard,
                    onPress: () => open('/payment-methods'),
                  },
                  {
                    key: 'transactions',
                    title: 'Transactions',
                    text: 'Payments for visits, orders and plans',
                    icon: Receipt,
                    onPress: () => open('/transactions'),
                  },
                  {
                    key: 'refer',
                    title: 'Refer someone',
                    text: 'Share your code and earn coins',
                    icon: Gift,
                    onPress: () => open('/refer'),
                  },
                ]}
              />
            </View>

            <View className="gap-3">
              <Text className="text-lg font-extrabold">Account</Text>
              <MenuList
                items={[
                  {
                    key: 'notifications',
                    title: 'Notifications',
                    text: unread ? `${unread} unread` : 'Updates, reminders and follow-through',
                    icon: Bell,
                    badge: unread ? String(unread) : undefined,
                    onPress: () => open('/notifications'),
                  },
                  {
                    key: 'settings',
                    title: 'Settings',
                    text: 'PIN, notifications and appearance',
                    icon: Settings,
                    onPress: () => open('/settings'),
                  },
                  {
                    key: 'support',
                    title: 'Privacy and security',
                    text: 'Devices and record privacy',
                    icon: HeartHandshake,
                    onPress: () => open('/security'),
                  },
                ]}
              />
              <MenuList
                items={[
                  {
                    key: 'sign-out',
                    title: 'Sign out',
                    text: 'You can sign back in with your PIN',
                    icon: LogOut,
                    danger: true,
                    onPress: confirmSignOut,
                  },
                ]}
              />
            </View>
          </FadeIn>
        </>
      )}
    </BodyLayout>
  );
}
