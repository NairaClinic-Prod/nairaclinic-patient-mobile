import { PressableScale } from '@/components/shared/pressable-scale';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import * as Haptics from 'expo-haptics';
import {
  MessageCircle,
  Mic,
  MicOff,
  PhoneOff,
  SwitchCamera,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
} from 'lucide-react-native';
import { View } from 'react-native';
import type { ChatState } from '../chat';
import type { CallState } from '../hooks';
import { Text } from '@/components/ui/text';

function Round({
  label,
  on = true,
  danger,
  onPress,
  children,
}: {
  label: string;
  on?: boolean;
  danger?: boolean;
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <PressableScale
      scaleTo={0.92}
      role="button"
      accessibilityLabel={label}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      className={cn(
        'size-12 items-center justify-center rounded-full',
        danger ? 'bg-destructive' : on ? 'bg-white/20' : 'bg-white'
      )}>
      {children}
    </PressableScale>
  );
}

// Five round buttons under the video: the things people reach for in a call, and nothing else.
export function CallControls({ call, chat }: { call: CallState; chat: ChatState }) {
  return (
    <View className="flex-row items-center justify-center gap-2.5">
      <Round
        label={call.isAudioOn ? 'Mute' : 'Unmute'}
        on={call.isAudioOn}
        onPress={call.toggleAudio}>
        <Icon
          as={call.isAudioOn ? Mic : MicOff}
          className={cn('size-5', call.isAudioOn ? 'text-white' : 'text-black')}
        />
      </Round>
      <Round
        label={call.isVideoOn ? 'Turn camera off' : 'Turn camera on'}
        on={call.isVideoOn}
        onPress={call.toggleVideo}>
        <Icon
          as={call.isVideoOn ? Video : VideoOff}
          className={cn('size-5', call.isVideoOn ? 'text-white' : 'text-black')}
        />
      </Round>
      <View>
        <Round label="Open chat" onPress={() => chat.setOpen(true)}>
          <Icon as={MessageCircle} className="size-5 text-white" />
        </Round>
        {chat.unread > 0 ? (
          <View className="absolute -top-1 -right-1 min-w-5 items-center rounded-full bg-destructive px-1.5 py-0.5">
            <Text className="text-[11px] font-semibold text-white">
              {chat.unread > 9 ? '9+' : chat.unread}
            </Text>
          </View>
        ) : null}
      </View>
      {call.isVideoOn ? (
        <Round label="Switch camera" onPress={call.flipCamera}>
          <Icon as={SwitchCamera} className="size-5 text-white" />
        </Round>
      ) : null}
      <Round
        label={call.speakerOn ? 'Use earpiece' : 'Use speaker'}
        on={call.speakerOn}
        onPress={call.toggleSpeaker}>
        <Icon
          as={call.speakerOn ? Volume2 : VolumeX}
          className={cn('size-5', call.speakerOn ? 'text-white' : 'text-black')}
        />
      </Round>
      <Round label="Leave the call" danger onPress={call.leave}>
        <Icon as={PhoneOff} className="size-5 text-white" />
      </Round>
    </View>
  );
}
