import { FadeIn } from '@/components/shared/fade-in';
import { BodyLayout } from '@/components/common/body-layout';
import TabHeader from '@/components/common/header';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { router, type Href } from 'expo-router';
import {
  CreditCard,
  HeartPulse,
  LockKeyhole,
  LogOut,
  Receipt,
  Settings,
  SlidersHorizontal,
  UserRound,
} from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { MenuList } from '../components/menu-list';
import { ProfileHero } from '../components/profile-hero';
import { SummaryTiles } from '../components/summary-tiles';
import { WalletCard } from '../components/wallet-card';
import { SECTION_COPY } from '../constants';
import { initialsOf, useProfile } from '../hooks/use-profile';
import type { AccountSection } from '../types';

const open = (section: AccountSection) => router.push(`/account/${section}` as Href);

export function ProfileScreen() {
  const { profile, cards, transactions, wallet } = useProfile();

  return (
    <BodyLayout scrollView tabBar className="gap-5">
      <TabHeader
        title="Profile"
        right={
          <Pressable
            role="button"
            accessibilityLabel="Preferences"
            onPress={() => open('preferences')}
            className="bg-card size-11 items-center justify-center rounded-full active:opacity-70">
            <Icon as={Settings} className="text-foreground size-5" />
          </Pressable>
        }
      />

      <FadeIn index={0}>
        <ProfileHero
          initials={initialsOf(profile)}
          firstName={profile.firstName}
          contact={profile.email || profile.phone || 'Complete your personal details'}
          onEdit={() => open('personal')}
        />
      </FadeIn>

      <FadeIn index={1}>
        <WalletCard wallet={wallet} onPress={() => open('payment-methods')} />
      </FadeIn>

      <FadeIn index={2}>
        <SummaryTiles
          cards={cards.length}
          payments={transactions.length}
          onCards={() => open('payment-methods')}
          onTransactions={() => open('transactions')}
        />
      </FadeIn>

      <FadeIn index={3} className="gap-3">
        <Text className="text-lg font-extrabold">Personal information</Text>
        <MenuList
          items={[
            {
              key: 'personal',
              title: SECTION_COPY.personal.title,
              text: 'Manage your account details',
              icon: UserRound,
              onPress: () => open('personal'),
            },
            {
              key: 'health',
              title: SECTION_COPY.health.title,
              text: 'Blood group, allergies and conditions',
              icon: HeartPulse,
              onPress: () => open('health'),
            },
            {
              key: 'preferences',
              title: SECTION_COPY.preferences.title,
              text: 'Language, smoking and alcohol',
              icon: SlidersHorizontal,
              onPress: () => open('preferences'),
            },
          ]}
        />
      </FadeIn>

      <FadeIn index={4} className="gap-3">
        <Text className="text-lg font-extrabold">Account</Text>
        <MenuList
          items={[
            {
              key: 'payment-methods',
              title: SECTION_COPY['payment-methods'].title,
              text: 'Your wallet and saved cards',
              icon: CreditCard,
              onPress: () => open('payment-methods'),
            },
            {
              key: 'transactions',
              title: SECTION_COPY.transactions.title,
              text: 'Payments for visits, orders and plans',
              icon: Receipt,
              onPress: () => open('transactions'),
            },
            {
              key: 'security',
              title: SECTION_COPY.security.title,
              text: 'PIN, fingerprint and privacy',
              icon: LockKeyhole,
              onPress: () => open('security'),
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
              onPress: () => router.replace('/auth/login'),
            },
          ]}
        />
      </FadeIn>
    </BodyLayout>
  );
}
