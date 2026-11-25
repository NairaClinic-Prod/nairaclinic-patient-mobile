import { PressableScale } from '@/components/shared/pressable-scale';
import { HScroll } from '@/components/shared/h-scroll';
import { SectionHeader } from '@/components/shared/section-header';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { CalendarPlus, Plus } from 'lucide-react-native';
import { router } from 'expo-router';
import { Image, View } from 'react-native';
import type { CareTeamDoctor } from '../types';
import { drName, initials } from '../utils';

type CareTeamStripProps = {
  members: CareTeamDoctor[];
  onSelect?: (member: CareTeamDoctor) => void;
  onSeeAll?: () => void;
  onBook?: () => void;
};

const openDoctor = (member: CareTeamDoctor) =>
  router.push(member.bookingSlug ? `/book/doctor/${member.bookingSlug}` : '/book');
const openBooking = () => router.push('/book');
const findDoctor = () => router.push('/book/find');

// Works the same on every screen: a doctor opens their booking page, "See all" opens booking and "Add a doctor" finds one.
export function CareTeamStrip({
  members,
  onSelect = openDoctor,
  onSeeAll = openBooking,
  onBook = findDoctor,
}: CareTeamStripProps) {
  return (
    <View className="gap-3">
      <SectionHeader title="Your care team" action="See all" onActionPress={onSeeAll} />
      <HScroll>
        {members.map((member) => (
          <View
            key={member.doctorUserId}
            className="h-[188px] w-32 gap-1.5 rounded-2xl bg-card p-2.5">
            <PressableScale
              scaleTo={0.98}
              role="button"
              onPress={() => onSelect?.(member)}
              className="flex-1 items-center justify-center gap-2 rounded-xl bg-secondary/40 p-2.5">
              {member.photoUrl ? (
                <Image source={{ uri: member.photoUrl }} className="size-12 rounded-full" />
              ) : (
                <View className="size-12 items-center justify-center rounded-full bg-secondary">
                  <Text className="text-base font-bold text-secondary-foreground">
                    {initials(member.name)}
                  </Text>
                </View>
              )}
              <View className="h-8 justify-center">
                <Text className="text-center text-xs leading-4 font-bold" numberOfLines={2}>
                  {member.kind === 'nairaclinic' ? member.name : drName(member.name)}
                </Text>
              </View>
              <View className="h-4 justify-center">
                <Text className="text-center text-[11px] text-muted-foreground" numberOfLines={1}>
                  {member.specialty ?? ' '}
                </Text>
              </View>
            </PressableScale>
            <View className="h-9">
              {member.hasOpenSlots ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-xl"
                  accessibilityLabel={`Book ${drName(member.name)} again`}
                  onPress={() => onSelect?.(member)}>
                  <Icon as={CalendarPlus} className="size-3.5 text-primary" />
                  <Text className="text-xs text-primary">Book again</Text>
                </Button>
              ) : null}
            </View>
          </View>
        ))}
        <PressableScale
          scaleTo={0.98}
          role="button"
          onPress={onBook}
          className="h-[188px] w-32 items-center justify-center gap-1.5 rounded-2xl border border-dashed border-primary/40 bg-secondary/40 p-3">
          <View className="size-10 items-center justify-center rounded-full bg-card">
            <Icon as={Plus} className="size-4 text-primary" />
          </View>
          <Text className="text-xs font-bold">Add a doctor</Text>
          {members.length ? null : (
            <Text className="text-center text-[11px] text-muted-foreground">
              Your doctors appear here after a consultation
            </Text>
          )}
        </PressableScale>
      </HScroll>
    </View>
  );
}
