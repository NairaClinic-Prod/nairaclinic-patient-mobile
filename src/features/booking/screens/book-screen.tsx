import { PressableScale } from '@/components/shared/pressable-scale';
import { SubScreen } from '@/components/shared/sub-screen';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useHome } from '@/features/home/hooks/use-home';
import { drName } from '@/features/home/utils';
import { router } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';
import { DoctorAvatar } from '../components/doctor-avatar';
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
          <View className="gap-3">
            <Text className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Your care team
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="-mx-6"
              contentContainerClassName="gap-3 px-6">
              {team.map((member) => (
                <PressableScale
                  key={member.doctorUserId}
                  scaleTo={0.97}
                  role="button"
                  accessibilityLabel={`Book ${drName(member.name)}`}
                  onPress={() => router.push(`/book/doctor/${member.bookingSlug}`)}
                  className="w-36 items-center gap-2 rounded-2xl bg-card p-3.5">
                  <DoctorAvatar name={member.name} size={48} />
                  <View className="items-center gap-0.5 self-stretch">
                    <Text className="text-center text-[13px] font-bold" numberOfLines={1}>
                      {drName(member.name)}
                    </Text>
                    <Text
                      className="text-center text-[11px] text-muted-foreground"
                      numberOfLines={1}>
                      {member.specialty ?? ' '}
                    </Text>
                  </View>
                </PressableScale>
              ))}
            </ScrollView>
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
