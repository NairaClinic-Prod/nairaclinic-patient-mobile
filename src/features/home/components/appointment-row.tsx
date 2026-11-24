import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { Building2, ChevronRight, Video } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
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
  const detail = `${inPerson ? 'In person' : 'Video call'} · ${formatWhen(appointment.scheduledAtUtc)}${
    appointment.durationMins ? ` · ${appointment.durationMins} min` : ''
  }`;

  return (
    <Pressable
      role="button"
      onPress={onPress}
      className={cn(
        'border-border h-[68px] flex-row items-center gap-3 px-3.5 active:opacity-70',
        last ? '' : 'border-b'
      )}>
      <View className="bg-secondary size-11 items-center justify-center rounded-xl">
        {parts ? (
          <>
            <Text className="text-primary text-[9px] font-bold leading-3 tracking-wider">
              {parts.month}
            </Text>
            <Text className="text-primary text-base font-extrabold leading-5">{parts.day}</Text>
          </>
        ) : (
          <Text className="text-primary text-[11px] font-bold">TBC</Text>
        )}
      </View>
      <View className="flex-1 gap-0.5">
        <Text className="text-[13px] font-bold" numberOfLines={1}>
          {appointment.isSmartRequest ? SMART_REQUEST_DOCTOR_LABEL : drName(appointment.doctorName)}
        </Text>
        <View className="flex-row items-center gap-1.5">
          <Icon as={inPerson ? Building2 : Video} className="text-muted-foreground size-3" />
          <Text className="text-muted-foreground flex-1 text-[11px]" numberOfLines={1}>
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
      {ready ? null : <Icon as={ChevronRight} className="text-muted-foreground size-4" />}
    </Pressable>
  );
}
