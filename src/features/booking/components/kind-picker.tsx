import { Choosable } from '@/components/shared/choosable';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { Building2, Mic, Video, type LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

export type KindOption<T extends string> = {
  value: T;
  title: string;
  text: string;
  icon: LucideIcon;
};

export const VIDEO_OPTION = {
  value: 'video',
  title: 'Video',
  text: 'Meet the doctor online.',
  icon: Video,
} as const;
export const IN_PERSON_OPTION = {
  value: 'in_person',
  title: 'In person',
  text: 'Visit the doctor at their practice.',
  icon: Building2,
} as const;
export const AUDIO_OPTION = {
  value: 'audio',
  title: 'Audio',
  text: 'Talk by voice call.',
  icon: Mic,
} as const;

type KindPickerProps<T extends string> = {
  options: KindOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
};

export function KindPicker<T extends string>({ options, value, onChange }: KindPickerProps<T>) {
  return (
    <View className="flex-row gap-3">
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <View key={option.value} className="flex-1">
            <Choosable
              selected={selected}
              label={option.title}
              onPress={() => onChange(option.value)}>
              <Icon
                as={option.icon}
                className={cn('mb-2 size-5', selected ? 'text-primary' : 'text-muted-foreground')}
              />
              <Text className="text-[15px] font-bold">{option.title}</Text>
              <Text className="mt-0.5 text-xs leading-4 text-muted-foreground">{option.text}</Text>
            </Choosable>
          </View>
        );
      })}
    </View>
  );
}
