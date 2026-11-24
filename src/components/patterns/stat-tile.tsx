import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

type Tone = 'teal' | 'warm' | 'mint';

const TONE: Record<Tone, { box: string; text: string; sub: string; badge: string; icon: string }> =
  {
    teal: {
      box: 'bg-primary',
      text: 'text-primary-foreground',
      sub: 'text-primary-foreground/75',
      badge: 'bg-white/15',
      icon: 'text-primary-foreground',
    },
    warm: {
      box: 'bg-warning-soft',
      text: 'text-foreground',
      sub: 'text-warning',
      badge: 'bg-card/70',
      icon: 'text-warning',
    },
    mint: {
      box: 'bg-secondary',
      text: 'text-foreground',
      sub: 'text-secondary-foreground',
      badge: 'bg-card/70',
      icon: 'text-primary',
    },
  };

type StatTileProps = {
  label: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  tone: Tone;
};

export function StatTile({ label, value, unit, icon, tone }: StatTileProps) {
  const style = TONE[tone];
  return (
    <View className={cn('min-h-22.5 flex-1 justify-between gap-2 rounded-2xl p-3', style.box)}>
      <View className="flex-row items-center gap-3">
        <View className={cn('size-8 items-center justify-center rounded-full', style.badge)}>
          <Icon as={icon} className={cn('size-4', style.icon)} />
        </View>
        <Text className={cn('text-xl leading-6 font-extrabold', style.text)} numberOfLines={1}>
          {value}
        </Text>
      </View>
      <View>
        <Text className={cn('text-[11px] font-semibold', style.sub)} numberOfLines={2}>
          {unit ? `${label} · ${unit}` : label}
        </Text>
      </View>
    </View>
  );
}
