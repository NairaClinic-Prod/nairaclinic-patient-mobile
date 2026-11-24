import { FadeIn } from '@/components/shared/fade-in';
import { BodyLayout } from '@/components/common/body-layout';
import { SubScreenHeader } from '@/components/shared/sub-screen-header';
import { Text } from '@/components/ui/text';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { PaymentMethodsView } from '../components/payment-methods-view';
import { ProfileForm } from '../components/profile-form';
import { SecurityView } from '../components/security-view';
import { TransactionsView } from '../components/transactions-view';
import { SECTION_COPY } from '../constants';
import type { AccountSection } from '../types';

const isSection = (value: unknown): value is AccountSection =>
  typeof value === 'string' && value in SECTION_COPY;

export function AccountSectionScreen() {
  const { section } = useLocalSearchParams<{ section: string }>();

  if (!isSection(section)) return <Redirect href="/profile" />;
  if (section === 'personal' || section === 'health' || section === 'preferences') {
    return <ProfileForm key={section} section={section} />;
  }

  const copy = SECTION_COPY[section];

  return (
    <BodyLayout scrollView className="gap-4 pt-2">
      <SubScreenHeader title={copy.title} />
      <Text className="text-muted-foreground text-xs leading-4.5">{copy.description}</Text>
      <FadeIn index={1}>
        {section === 'payment-methods' ? <PaymentMethodsView /> : null}
        {section === 'transactions' ? <TransactionsView /> : null}
        {section === 'security' ? <SecurityView /> : null}
      </FadeIn>
    </BodyLayout>
  );
}
