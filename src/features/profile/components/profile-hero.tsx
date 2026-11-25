import { ChoiceSheet } from '@/components/shared/choice-sheet';
import { PressableScale } from '@/components/shared/pressable-scale';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Camera, Image as ImageIcon, ShieldCheck, Trash2 } from 'lucide-react-native';
import * as React from 'react';
import { View } from 'react-native';
import { pickPhoto, removePhoto, usePhoto, type PhotoSource } from '../hooks/use-photo';
import { Avatar } from './avatar';

type ProfileHeroProps = {
  name: string;
  detail: string;
  contact: string;
};

export function ProfileHero({ name, detail, contact }: ProfileHeroProps) {
  const photo = usePhoto();
  const [open, setOpen] = React.useState(false);
  const [problem, setProblem] = React.useState<string | null>(null);

  const choices = [
    {
      key: 'camera' as const,
      title: 'Take a photo',
      description: 'Use your camera',
      icon: Camera,
    },
    {
      key: 'library' as const,
      title: 'Choose a photo',
      description: 'From your photo library',
      icon: ImageIcon,
    },
    ...(photo
      ? [
          {
            key: 'remove' as const,
            title: 'Remove photo',
            description: 'Go back to your initials',
            icon: Trash2,
          },
        ]
      : []),
  ];

  async function pick(key: PhotoSource | 'remove') {
    setProblem(null);
    if (key === 'remove') return removePhoto();
    // The picker needs the sheet to finish closing before it can open.
    await new Promise((resolve) => setTimeout(resolve, 350));
    setProblem(await pickPhoto(key));
  }

  return (
    <View className="gap-2">
      <View className="flex-row items-center gap-4">
        <PressableScale
          scaleTo={0.96}
          role="button"
          accessibilityLabel={photo ? 'Change profile photo' : 'Add a profile photo'}
          onPress={() => setOpen(true)}>
          <Avatar uri={photo} size={88} />
          <View className="absolute -right-1 -bottom-1 size-9 items-center justify-center rounded-full border-[3px] border-background bg-card">
            <Icon as={Camera} className="size-4 text-foreground" />
          </View>
        </PressableScale>
        <View className="flex-1 gap-0.5">
          <Text className="text-xl font-extrabold tracking-tight" numberOfLines={2}>
            {name}
          </Text>
          {detail ? <Text className="text-[13px] font-semibold">{detail}</Text> : null}
          <Text className="text-[13px] text-muted-foreground" numberOfLines={1}>
            {contact}
          </Text>
          <View className="mt-1.5 flex-row items-center gap-1.5 self-start rounded-full bg-secondary px-3 py-1.5">
            <Icon as={ShieldCheck} className="size-3.5 text-success" />
            <Text className="text-[11px] font-semibold text-success">Private and secure</Text>
          </View>
        </View>
      </View>
      {problem ? (
        <Text className="text-center text-xs leading-4.5 text-destructive">{problem}</Text>
      ) : null}

      <ChoiceSheet<PhotoSource | 'remove'>
        open={open}
        onClose={() => setOpen(false)}
        title="Profile photo"
        subtitle="It replaces your initials across the app."
        choices={choices}
        onPick={pick}
      />
    </View>
  );
}
