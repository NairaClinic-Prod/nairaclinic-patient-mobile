import { PressableScale } from '@/components/shared/pressable-scale';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import * as Haptics from 'expo-haptics';
import {
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
import type { CallState } from '../hooks';

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
        'size-14 items-center justify-center rounded-full',
        danger ? 'bg-destructive' : on ? 'bg-white/20' : 'bg-white'
      )}>
      {children}
    </PressableScale>
  );
}

// Five round buttons under the video: the things people reach for in a call, and nothing else.
export function CallControls({ call }: { call: CallState }) {
  return (
    <View className="flex-row items-center justify-center gap-3.5">
      <Round
        label={call.isAudioOn ? 'Mute' : 'Unmute'}
        on={call.isAudioOn}
        onPress={call.toggleAudio}>
        <Icon
          as={call.isAudioOn ? Mic : MicOff}
          className={cn('size-6', call.isAudioOn ? 'text-white' : 'text-black')}
        />
      </Round>
      <Round
        label={call.isVideoOn ? 'Turn camera off' : 'Turn camera on'}
        on={call.isVideoOn}
        onPress={call.toggleVideo}>
        <Icon
          as={call.isVideoOn ? Video : VideoOff}
          className={cn('size-6', call.isVideoOn ? 'text-white' : 'text-black')}
        />
      </Round>
      {call.isVideoOn ? (
        <Round label="Switch camera" onPress={call.flipCamera}>
          <Icon as={SwitchCamera} className="size-6 text-white" />
        </Round>
      ) : null}
      <Round
        label={call.speakerOn ? 'Use earpiece' : 'Use speaker'}
        on={call.speakerOn}
        onPress={call.toggleSpeaker}>
        <Icon
          as={call.speakerOn ? Volume2 : VolumeX}
          className={cn('size-6', call.speakerOn ? 'text-white' : 'text-black')}
        />
      </Round>
      <Round label="Leave the call" danger onPress={call.leave}>
        <Icon as={PhoneOff} className="size-6 text-white" />
      </Round>
    </View>
  );
}
