import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { View } from 'react-native';
import type { CallState } from '../hooks';
import type { LinkQuality } from '../network';

const worst = (a: LinkQuality, b: LinkQuality): LinkQuality => {
  const rank: Record<LinkQuality, number> = { poor: 0, fair: 1, good: 2, unknown: 3 };
  return rank[a] <= rank[b] ? a : b;
};

const clock = (ms: number) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(total / 60);
  return `${String(minutes).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};

function useElapsed(since: number | null) {
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    if (!since) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [since]);
  return since ? clock(now - since) : null;
}

// One quiet line: who, how long, and how the connection is. The dot turns amber and red as it weakens.
export function CallStatus({ call, title }: { call: CallState; title: string }) {
  const elapsed = useElapsed(call.connectedAt);
  const quality = !call.online ? 'poor' : worst(call.uplink, call.downlink);
  const label = !call.online
    ? 'Offline. Reconnecting…'
    : call.phase === 'reconnecting'
      ? 'Reconnecting…'
      : quality === 'poor'
        ? 'Weak connection'
        : quality === 'fair'
          ? 'Fair connection'
          : 'Connected';
  return (
    <View className="items-center gap-1">
      <Text className="text-[17px] font-semibold text-white">{title}</Text>
      <View className="flex-row items-center gap-2">
        <View
          className={cn(
            'size-2 rounded-full',
            quality === 'poor'
              ? 'bg-red-500'
              : quality === 'fair'
                ? 'bg-amber-400'
                : 'bg-emerald-400'
          )}
        />
        <Text className="text-[13px] text-white/75">
          {elapsed ? `${elapsed} · ${label}` : label}
        </Text>
      </View>
    </View>
  );
}

// Short messages that fade by themselves: someone joined, the connection changed.
export function Notices({ call }: { call: CallState }) {
  return (
    <View className="gap-2" pointerEvents="none">
      {call.notices.map((notice) => (
        <View
          key={notice.id}
          className={cn(
            'self-center rounded-full px-4 py-2',
            notice.tone === 'warning' ? 'bg-amber-500/90' : 'bg-white/20'
          )}>
          <Text className="text-[13px] text-white">{notice.text}</Text>
        </View>
      ))}
    </View>
  );
}
