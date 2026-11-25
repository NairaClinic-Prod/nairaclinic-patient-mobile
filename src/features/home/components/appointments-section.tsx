import { SectionHeader } from '@/components/shared/section-header';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { SCREEN_PADDING_X } from '@/constants/ui';
import { CalendarDays } from 'lucide-react-native';
import { View } from 'react-native';
import type { DashboardAppointment } from '../types';
import { AppointmentRow } from './appointment-row';

type AppointmentsSectionProps = {
  title: string;
  appointments: DashboardAppointment[];
  ready?: boolean;
  onSeeAll?: () => void;
  onOpen?: (appointment: DashboardAppointment) => void;
  onBook?: () => void;
};

export function AppointmentsSection({
  title,
  appointments,
  ready = false,
  onSeeAll,
  onOpen,
  onBook,
}: AppointmentsSectionProps) {
  return (
    <View className="gap-3">
      <SectionHeader
        title={appointments.length ? `${title} · ${appointments.length}` : title}
        action="See all"
        onActionPress={onSeeAll}
      />
      <View
        className="overflow-hidden rounded-2xl bg-card"
        style={{ marginHorizontal: SCREEN_PADDING_X }}>
        {appointments.length ? (
          appointments.map((appointment, index) => (
            <AppointmentRow
              key={appointment.id}
              appointment={appointment}
              ready={ready}
              last={index === appointments.length - 1}
              onPress={() => onOpen?.(appointment)}
            />
          ))
        ) : (
          <View className="items-center gap-2.5 p-5">
            <View className="size-10 items-center justify-center rounded-full bg-secondary">
              <Icon as={CalendarDays} className="size-4 text-primary" />
            </View>
            <Text className="text-xs text-muted-foreground">No upcoming consultations.</Text>
            <Button variant="default" size="sm" className="rounded-xl" onPress={onBook}>
              <Text className="text-xs">Book a doctor</Text>
            </Button>
          </View>
        )}
      </View>
    </View>
  );
}
