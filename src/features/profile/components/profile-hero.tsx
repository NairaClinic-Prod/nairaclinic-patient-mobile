import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Pencil, ShieldCheck } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

type ProfileHeroProps = {
  initials: string;
  firstName: string;
  contact: string;
  onEdit: () => void;
};

export function ProfileHero({ initials, firstName, contact, onEdit }: ProfileHeroProps) {
  return (
    <View className="items-center gap-1">
      <View>
        <View className="bg-secondary size-24 items-center justify-center rounded-full">
          <Text className="text-primary text-3xl font-extrabold">{initials}</Text>
        </View>
        <Pressable
          role="button"
          accessibilityLabel="Edit personal information"
          onPress={onEdit}
          className="bg-card border-background absolute -bottom-1 -right-1 size-9 items-center justify-center rounded-full border-[3px] active:opacity-70">
          <Icon as={Pencil} className="text-foreground size-4" />
        </Pressable>
      </View>
      <Text className="mt-3 text-2xl font-extrabold">{firstName ? `Hello, ${firstName}` : 'Hello'}</Text>
      <Text className="text-muted-foreground text-[13px]">{contact}</Text>
      <View className="bg-secondary mt-2 flex-row items-center gap-1.5 rounded-full px-3 py-1.5">
        <Icon as={ShieldCheck} className="text-success size-3.5" />
        <Text className="text-success text-[11px] font-semibold">Private and secure</Text>
      </View>
    </View>
  );
}
