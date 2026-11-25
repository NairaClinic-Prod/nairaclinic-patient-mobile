import { ButtonRow } from '@/components/shared/button-row';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import type { LucideIcon } from 'lucide-react-native';
import type * as React from 'react';
import { View } from 'react-native';

type RecordRowProps = {
  icon?: LucideIcon;
  actions?: React.ReactNode;
  trailing?: React.ReactNode;
  trailingCenter?: boolean;
  children: React.ReactNode;
};

export function RecordRow({ icon, actions, trailing, trailingCenter, children }: RecordRowProps) {
  return (
    <View className="gap-3 py-3.5">
      <View className="flex-row gap-3">
        {icon ? (
          <View className="size-10 items-center justify-center rounded-full bg-secondary">
            <Icon as={icon} className="size-4.5 text-primary" />
          </View>
        ) : null}
        <View className="min-w-0 flex-1 gap-2">{children}</View>
        {trailing ? (
          <View className={trailingCenter ? 'justify-center' : 'justify-start'}>{trailing}</View>
        ) : null}
      </View>
      {actions ? <ButtonRow>{actions}</ButtonRow> : null}
    </View>
  );
}

export function RecordNote({ children }: { children: string }) {
  return (
    <Text className="w-full rounded-xl bg-muted px-3 py-2.5 text-xs leading-4.5 text-muted-foreground">
      {children}
    </Text>
  );
}

type Fact = { label: string; value: string };

export function FactGrid({ facts }: { facts: Fact[] }) {
  return (
    <View className="flex-row flex-wrap">
      {facts.map((fact) => (
        <View key={fact.label} className="w-1/2 gap-0.5 border-b border-border/70 py-2 pr-2">
          <Text className="text-[11px] text-muted-foreground">{fact.label}</Text>
          <Text className="text-[13px] leading-4.5 font-semibold">{fact.value}</Text>
        </View>
      ))}
    </View>
  );
}

export function RecordTag({ children }: { children: string }) {
  return (
    <Text className="self-start overflow-hidden rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
      {children}
    </Text>
  );
}
