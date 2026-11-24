import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { ScrollView, View } from 'react-native';

type SectionCardProps = {
  title: string;
  count: number;
  tone?: 'plain' | 'test';
  actions?: React.ReactNode;
  children: React.ReactNode;
};

export function SectionCard({ title, count, tone = 'plain', actions, children }: SectionCardProps) {
  const rows = React.Children.toArray(children);
  return (
    <View className={cn('px-4', tone === 'test' ? 'bg-secondary/45' : 'bg-card')}>
      <View className="border-border/70 gap-3 border-b py-3.5">
        <Text className="text-[15px] font-bold">
          {title} <Text className="text-muted-foreground text-sm font-normal">{count}</Text>
        </Text>
        {actions ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginHorizontal: -16 }}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
            {actions}
          </ScrollView>
        ) : null}
      </View>
      {rows.map((row, index) => (
        <View key={index} className={index ? 'border-border/70 border-t' : ''}>
          {row}
        </View>
      ))}
    </View>
  );
}
