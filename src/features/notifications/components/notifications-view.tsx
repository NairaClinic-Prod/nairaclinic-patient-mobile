import { ActionButton } from '@/components/shared/action-button';
import { EmptyState } from '@/components/shared/empty-state';
import { PressableScale } from '@/components/shared/pressable-scale';
import { Text } from '@/components/ui/text';
import { useColor } from '@/hooks/use-color';
import { formatWhen } from '@/features/orders/utils';
import { cn } from '@/lib/utils';
import { router, type Href } from 'expo-router';
import { Bell, CheckCheck } from 'lucide-react-native';
import * as React from 'react';
import { Switch, View } from 'react-native';
import { markAllNotificationsRead, markNotificationRead, useNotifications } from '../store';

export function NotificationsView() {
  const color = useColor();
  const { rows } = useNotifications();
  const [unreadOnly, setUnreadOnly] = React.useState(false);
  const unread = rows.filter((row) => !row.isRead).length;
  const shown = unreadOnly ? rows.filter((row) => !row.isRead) : rows;

  return (
    <View className="gap-4">
      <View className="flex-row items-center justify-between gap-3">
        <View className="flex-row items-center gap-2">
          <Switch
            accessibilityLabel="Unread only"
            value={unreadOnly}
            onValueChange={setUnreadOnly}
            trackColor={{ false: color.border, true: color.primary }}
            ios_backgroundColor={color.border}
            style={{ transform: [{ scale: 0.8 }] }}
          />
          <Text className="text-muted-foreground text-[13px]">Unread only</Text>
        </View>
        <ActionButton
          label="Mark all read"
          icon={CheckCheck}
          variant="outline"
          disabled={unread === 0}
          onPress={markAllNotificationsRead}
        />
      </View>

      <View className="bg-card overflow-hidden rounded-2xl">
        {shown.length ? (
          shown.map((row, index) => (
            <PressableScale
              key={row.id}
              scaleTo={0.99}
              role="button"
              onPress={() => {
                if (!row.isRead) markNotificationRead(row.id);
                if (row.path) router.navigate(row.path as Href);
              }}
              className={cn(
                'flex-row gap-3 px-4 py-3.5',
                index > 0 && 'border-border border-t',
                !row.isRead && 'bg-secondary/50'
              )}>
              <View
                className={cn(
                  'mt-1.5 size-2 rounded-full',
                  row.isRead ? 'bg-transparent' : 'bg-primary'
                )}
              />
              <View className="min-w-0 flex-1 gap-0.5">
                <Text className="text-[14px] leading-5 font-bold">{row.title}</Text>
                <Text className="text-muted-foreground text-[13px] leading-5">{row.message}</Text>
                <Text className="text-muted-foreground mt-0.5 text-xs">{`${formatWhen(row.createdAt)} · ${row.type}`}</Text>
              </View>
            </PressableScale>
          ))
        ) : (
          <EmptyState
            icon={Bell}
            title={unreadOnly ? 'You’re all caught up' : 'No notifications'}
            text={
              unreadOnly ? 'Nothing unread right now.' : 'Updates and reminders will appear here.'
            }
          />
        )}
      </View>
    </View>
  );
}
