import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { LinearGradient } from 'expo-linear-gradient';
import { Star, Trash2 } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { BRAND_COLORS, BRAND_NAME, detectBrand, type CardBrand } from '../card-brand';
import type { SavedCard } from '../types';

function BrandMark({ brand }: { brand: CardBrand }) {
  if (brand === 'mastercard') {
    return (
      <View className="flex-row items-center">
        <View className="size-7 rounded-full bg-[#eb001b]" />
        <View className="-ml-3 size-7 rounded-full bg-[#f79e1b]/90" />
      </View>
    );
  }
  if (brand === 'visa') {
    return (
      <Text className="text-[22px] leading-6 font-black tracking-tight text-white italic">
        VISA
      </Text>
    );
  }
  return (
    <Text className="text-[15px] leading-5 font-extrabold tracking-wide text-white uppercase">
      {brand === 'other' ? 'Card' : BRAND_NAME[brand]}
    </Text>
  );
}

function RoundButton({
  icon,
  label,
  onPress,
}: {
  icon: typeof Star;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      role="button"
      accessibilityLabel={label}
      onPress={onPress}
      className="size-8 items-center justify-center rounded-full bg-white/20 active:opacity-70">
      <Icon as={icon} className="size-4 text-white" />
    </Pressable>
  );
}

type CardFaceProps = {
  card: SavedCard;
  name: string;
  onMakeDefault: () => void;
  onRemove: () => void;
};

export function CardFace({ card, name, onMakeDefault, onRemove }: CardFaceProps) {
  const brand = detectBrand(card.brand);

  return (
    <View className="w-full overflow-hidden rounded-2xl">
      <LinearGradient
        colors={BRAND_COLORS[brand]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ aspectRatio: 1.9, padding: 16, justifyContent: 'space-between' }}>
        <View
          pointerEvents="none"
          className="absolute -top-16 -right-12 size-44 rounded-full bg-white/10"
        />
        <View className="flex-row items-center justify-between">
          <View className="h-7 w-9 rounded-md bg-[#e6c273]">
            <View className="absolute top-2.5 right-0 left-0 h-px bg-black/20" />
            <View className="absolute top-0 bottom-0 left-3 w-px bg-black/20" />
          </View>
          <View className="flex-row items-center gap-1.5">
            {card.isDefault ? (
              <View className="rounded-full bg-white/20 px-2.5 py-1">
                <Text className="text-[10px] font-semibold text-white">Used first</Text>
              </View>
            ) : (
              <RoundButton
                icon={Star}
                label={`Use ${BRAND_NAME[brand]} ending ${card.last4} first`}
                onPress={onMakeDefault}
              />
            )}
            <RoundButton
              icon={Trash2}
              label={`Remove ${BRAND_NAME[brand]} ending ${card.last4}`}
              onPress={onRemove}
            />
          </View>
        </View>

        <Text className="text-[19px] font-semibold tracking-[2.5px] text-white">
          {`••••  ••••  ••••  ${card.last4}`}
        </Text>

        <View className="flex-row items-end justify-between gap-3">
          <View className="min-w-0 flex-1 gap-0.5">
            <Text className="text-[10px] tracking-wide text-white/70 uppercase" numberOfLines={1}>
              {card.expiry ? `Valid thru ${card.expiry}` : 'Saved card'}
            </Text>
            <Text
              className="text-[13px] font-semibold tracking-wide text-white uppercase"
              numberOfLines={1}>
              {name}
            </Text>
          </View>
          <BrandMark brand={brand} />
        </View>
      </LinearGradient>
    </View>
  );
}
