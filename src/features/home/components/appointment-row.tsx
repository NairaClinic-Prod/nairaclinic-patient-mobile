import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { Building2, ChevronRight, Video } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { kindLabel } from '@/features/booking/kind-label';
import type { DashboardAppointment } from '../types';
import { dateParts, drName, formatWhen, relativeDay } from '../utils';

const SMART_REQUEST_DOCTOR_LABEL = 'Doctor on call';

type AppointmentRowProps = {
  appointment: DashboardAppointment;
  ready: boolean;
  last: boolean;
  onPress?: () => void;
};

export function AppointmentRow({ appointment, ready, last, onPress }: AppointmentRowProps) {
  const parts = dateParts(appointment.scheduledAtUtc);
  const inPerson = appointment.isInPerson;
  const chip = ready ? 'Join now' : relativeDay(appointment.scheduledAtUtc);
  const detail = `${inPerson ? 'In person' : kindLabel(appointment, 'Video call')} · ${formatWhen(appointment.scheduledAtUtc)}${
    appointment.durationMins ? ` · ${appointment.durationMins} min` : ''
  }`;

  return (
    <Pressable
      role="button"
      onPress={onPress}
      className={cn(
        'h-[68px] flex-row items-center gap-3 border-border px-3.5 active:opacity-70',
        last ? '' : 'border-b'
      )}>
      <View className="size-11 items-center justify-center rounded-xl bg-secondary">
        {parts ? (
          <>
            <Text className="text-[9px] leading-3 font-bold tracking-wider text-primary">
              {parts.month}
            </Text>
            <Text className="text-base leading-5 font-extrabold text-primary">{parts.day}</Text>
          </>
        ) : (
          <Text className="text-[11px] font-bold text-primary">TBC</Text>
        )}
      </View>
      <View className="flex-1 gap-0.5">
        <Text className="text-[13px] font-bold" numberOfLines={1}>
          {appointment.isSmartRequest ? SMART_REQUEST_DOCTOR_LABEL : drName(appointment.doctorName)}
        </Text>
        <View className="flex-row items-center gap-1.5">
          <Icon as={inPerson ? Building2 : Video} className="size-3 text-muted-foreground" />
          <Text className="flex-1 text-[11px] text-muted-foreground" numberOfLines={1}>
            {detail}
          </Text>
        </View>
      </View>
      {chip ? (
        <View className={cn('rounded-full px-2.5 py-1', ready ? 'bg-primary' : 'bg-muted')}>
          <Text
            className={cn(
              'text-[11px] font-bold',
              ready ? 'text-primary-foreground' : 'text-muted-foreground'
            )}>
            {chip}
          </Text>
        </View>
      ) : null}
      {ready ? null : <Icon as={ChevronRight} className="size-4 text-muted-foreground" />}
    </Pressable>
  );
}
