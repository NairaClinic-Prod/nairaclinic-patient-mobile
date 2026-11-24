import { HScroll } from '@/components/patterns/h-scroll';
import { SectionHeader } from '@/components/patterns/section-header';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { CalendarPlus, Plus } from 'lucide-react-native';
import { Image, Pressable, View } from 'react-native';
import type { CareTeamDoctor } from '../types';
import { drName, initials } from '../utils';

type CareTeamStripProps = {
  members: CareTeamDoctor[];
  onSelect?: (member: CareTeamDoctor) => void;
  onSeeAll?: () => void;
  onBook?: () => void;
};

export function CareTeamStrip({ members, onSelect, onSeeAll, onBook }: CareTeamStripProps) {
  return (
    <View className="gap-4">
      <SectionHeader title="Your care team" action="See all" onActionPress={onSeeAll} />
      <HScroll>
        {members.map((member) => (
          <View key={member.doctorUserId} className="bg-card h-[188px] w-32 gap-1.5 rounded-2xl p-2.5">
            <Pressable
              role="button"
              onPress={() => onSelect?.(member)}
              className="bg-secondary/40 flex-1 items-center justify-center gap-2 rounded-xl p-2.5 active:opacity-70">
              {member.photoUrl ? (
                <Image source={{ uri: member.photoUrl }} className="size-12 rounded-full" />
              ) : (
                <View className="bg-secondary size-12 items-center justify-center rounded-full">
                  <Text className="text-secondary-foreground text-base font-bold">
                    {initials(member.name)}
                  </Text>
                </View>
              )}
              <View className="h-8 justify-center">
                <Text className="text-center text-xs font-bold leading-4" numberOfLines={2}>
                  {drName(member.name)}
                </Text>
              </View>
              <View className="h-4 justify-center">
                <Text className="text-muted-foreground text-center text-[11px]" numberOfLines={1}>
                  {member.specialty ?? ' '}
                </Text>
              </View>
            </Pressable>
            <View className="h-9">
              {member.hasOpenSlots ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-xl"
                  accessibilityLabel={`Book ${drName(member.name)} again`}
                  onPress={() => onSelect?.(member)}>
                  <Icon as={CalendarPlus} className="text-primary size-3.5" />
                  <Text className="text-primary text-xs">Book again</Text>
                </Button>
              ) : null}
            </View>
          </View>
        ))}
        <Pressable
          role="button"
          onPress={onBook}
          className="border-primary/40 bg-secondary/40 h-[188px] w-32 items-center justify-center gap-1.5 rounded-2xl border border-dashed p-3 active:opacity-80">
          <View className="bg-card size-10 items-center justify-center rounded-full">
            <Icon as={Plus} className="text-primary size-4" />
          </View>
          <Text className="text-xs font-bold">Add a doctor</Text>
          {members.length ? null : (
            <Text className="text-muted-foreground text-center text-[11px]">
              Your doctors appear here after a consultation
            </Text>
          )}
        </Pressable>
      </HScroll>
    </View>
  );
}
