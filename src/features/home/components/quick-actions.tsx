import { PressableScale } from '@/components/shared/pressable-scale';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { SCREEN_PADDING_X } from '@/constants/ui';
import { FileHeart, Pill, Stethoscope, type LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

type CardProps = {
  label: string;
  text: string;
  icon: LucideIcon;
  onPress?: () => void;
};

function ActionCard({ label, text, icon, onPress }: CardProps) {
  return (
    <PressableScale
      scaleTo={0.97}
      role="button"
      accessibilityLabel={`${label}. ${text}`}
      onPress={onPress}
      className="flex-1 items-center justify-center gap-1.5 rounded-2xl border border-border bg-card px-3 py-3.5">
      <Icon as={icon} className="size-[18px] text-primary" />
      <View className="items-center gap-px self-stretch">
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.85}
          className="text-center text-sm leading-5 font-semibold tracking-tight">
          {label}
        </Text>
        <Text className="text-center text-[11px] leading-4 text-muted-foreground" numberOfLines={1}>
          {text}
        </Text>
      </View>
    </PressableScale>
  );
}

type QuickActionsProps = {
  onBook?: () => void;
  onRecords?: () => void;
  onOrder?: () => void;
};

export function QuickActions({ onBook, onRecords, onOrder }: QuickActionsProps) {
  return (
    <View className="gap-2.5" style={{ paddingHorizontal: SCREEN_PADDING_X }}>
      <View className="flex-row items-stretch gap-2.5">
        <ActionCard
          label="Book a consultation"
          text="Find care today"
          icon={Stethoscope}
          onPress={onBook}
        />
        <ActionCard
          label="Medical records"
          text="View your history"
          icon={FileHeart}
          onPress={onRecords}
        />
      </View>
      <View className="flex-row">
        <ActionCard
          label="Make an order"
          text="Medicines or lab tests"
          icon={Pill}
          onPress={onOrder}
        />
      </View>
    </View>
  );
}
