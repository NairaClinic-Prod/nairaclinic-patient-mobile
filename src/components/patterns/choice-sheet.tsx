import { Sheet } from '@/components/patterns/sheet';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { ChevronRight, type LucideIcon } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

export type Choice<T extends string> = {
  key: T;
  title: string;
  description: string;
  icon: LucideIcon;
};

type ChoiceSheetProps<T extends string> = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  choices: Choice<T>[];
  onPick: (key: T) => void;
};

export function ChoiceSheet<T extends string>({
  open,
  onClose,
  title,
  subtitle,
  choices,
  onPick,
}: ChoiceSheetProps<T>) {
  return (
    <Sheet open={open} onClose={onClose} title={title} subtitle={subtitle}>
      <View className="gap-2.5">
        {choices.map((choice) => (
          <Pressable
            key={choice.key}
            role="button"
            onPress={() => {
              onClose();
              onPick(choice.key);
            }}
            className="bg-muted flex-row items-center gap-3 rounded-3xl p-3.5 active:opacity-70">
            <View className="bg-card size-10 items-center justify-center rounded-full">
              <Icon as={choice.icon} className="text-primary size-[18px]" />
            </View>
            <View className="flex-1 gap-0.5">
              <Text className="text-[13px] font-bold">{choice.title}</Text>
              <Text className="text-muted-foreground text-[11px] leading-4">
                {choice.description}
              </Text>
            </View>
            <Icon as={ChevronRight} className="text-muted-foreground size-4" />
          </Pressable>
        ))}
      </View>
    </Sheet>
  );
}
