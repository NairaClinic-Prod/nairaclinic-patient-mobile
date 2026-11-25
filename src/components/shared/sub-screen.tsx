import { BodyLayout } from '@/components/common/body-layout';
import { FadeIn } from '@/components/shared/fade-in';
import { SubScreenHeader } from '@/components/shared/sub-screen-header';
import { Text } from '@/components/ui/text';
import type * as React from 'react';

type SubScreenProps = {
  title: string;
  description?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
};

// The one shell for pages opened from the profile and other hubs: back button, blurred bar on scroll, then the page.
export function SubScreen({ title, description, right, children }: SubScreenProps) {
  return (
    <BodyLayout scrollView fixedHeader className="gap-4 pt-2">
      <SubScreenHeader title={title} right={right} />
      {description ? (
        <Text className="text-xs leading-4.5 text-muted-foreground">{description}</Text>
      ) : null}
      <FadeIn index={1}>{children}</FadeIn>
    </BodyLayout>
  );
}
