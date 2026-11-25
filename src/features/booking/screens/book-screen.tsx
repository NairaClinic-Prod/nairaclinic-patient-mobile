import { PressableScale } from '@/components/shared/pressable-scale';
import { SubScreen } from '@/components/shared/sub-screen';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useHome } from '@/features/home/hooks/use-home';
import { CareTeamStrip } from '@/features/home/components/care-team-strip';
import { router } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { View } from 'react-native';
import { BOOKING_CHOICES, type BookingChoiceKey } from '../constants';

export function BookScreen() {
  const { dashboard } = useHome();
  const team = dashboard.careTeam.filter((member) => member.bookingSlug);

  const choose = (key: BookingChoiceKey) =>
    router.push(key === 'smart' ? '/book/smart' : '/book/find');

  return (
    <SubScreen title="Book an appointment" description="How would you like to find your doctor?">
      <View className="gap-6">
        {team.length ? (
          <View className="-mx-6">
            <CareTeamStrip
              members={team}
              onSelect={(member) => router.push(`/book/doctor/${member.bookingSlug}`)}
              onBook={() => router.push('/book/find')}
            />
          </View>
        ) : null}

        <View className="gap-3">
          {BOOKING_CHOICES.map((choice) => (
            <PressableScale
              key={choice.key}
              scaleTo={0.985}
              role="button"
              onPress={() => choose(choice.key)}
              className="flex-row items-center gap-4 rounded-2xl bg-card p-4">
              <View className="size-12 items-center justify-center rounded-2xl bg-secondary">
                <Icon as={choice.icon} className="size-5 text-primary" />
              </View>
              <View className="min-w-0 flex-1 gap-0.5">
                <Text className="text-[15px] font-bold">{choice.title}</Text>
                <Text className="text-[13px] leading-5 text-muted-foreground">
                  {choice.description}
                </Text>
              </View>
              <Icon as={ChevronRight} className="size-5 text-muted-foreground" />
            </PressableScale>
          ))}
        </View>
      </View>
    </SubScreen>
  );
}
