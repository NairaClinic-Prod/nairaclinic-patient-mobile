import { PressableScale } from '@/components/patterns/pressable-scale';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { ArrowUpRight, ReceiptText, type LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

type TileProps = {
  pill: string;
  title: string;
  text: string;
  icon: LucideIcon;
  onPress: () => void;
};

function Tile({ pill, title, text, icon, onPress }: TileProps) {
  return (
    <PressableScale
      scaleTo={0.98}
      role="button"
      accessibilityLabel={title}
      onPress={onPress}
      className="bg-card min-h-[132px] flex-1 justify-between gap-3 rounded-3xl p-3.5">
      <View className="flex-row items-start justify-between">
        <View className="bg-secondary rounded-full px-3 py-1.5">
          <Text className="text-secondary-foreground text-xs font-bold">{pill}</Text>
        </View>
        <View className="bg-muted size-9 items-center justify-center rounded-full">
          <Icon as={icon} className="text-foreground size-4" />
        </View>
      </View>
      <View className="gap-0.5">
        <Text className="text-[13px] font-extrabold">{title}</Text>
        <Text className="text-muted-foreground text-xs leading-4">{text}</Text>
      </View>
    </PressableScale>
  );
}

type SummaryTilesProps = {
  cards: number;
  payments: number;
  onCards: () => void;
  onTransactions: () => void;
};

export function SummaryTiles({ cards, payments, onCards, onTransactions }: SummaryTilesProps) {
  return (
    <View className="flex-row gap-3">
      <Tile
        pill={cards === 1 ? '1 card' : `${cards} cards`}
        title="Payment methods"
        text="Pay in a tap with a saved card."
        icon={ArrowUpRight}
        onPress={onCards}
      />
      <Tile
        pill={payments === 1 ? '1 payment' : `${payments} payments`}
        title="Transactions"
        text="Everything you've paid for."
        icon={ReceiptText}
        onPress={onTransactions}
      />
    </View>
  );
}
