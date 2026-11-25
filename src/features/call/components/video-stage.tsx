import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { drName, initials } from '@/features/home/utils';
import { VideoAspect, VideoResolution, ZoomView } from '@zoom/react-native-videosdk';
import { VideoOff } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import type { CallState } from '../hooks';

// What the picture costs. A weak line or a slow phone connection gets a light stream; a good one gets
// a sharp one. Zoom adapts the bitrate on its own; this decides how much picture we ask for.
function resolutionFor(call: CallState) {
  if (call.downlink === 'poor' || call.slow || !call.online) return VideoResolution.Resolution180P;
  if (call.downlink === 'good') return VideoResolution.Resolution720P;
  return VideoResolution.Resolution360P;
}

// The other person fills the screen; you are a small picture in the corner.
export function VideoStage({ call, name }: { call: CallState; name: string | null }) {
  const featured =
    call.remotes.find((remote) => remote.userId === call.activeSpeaker && remote.videoOn) ??
    call.remotes.find((remote) => remote.videoOn) ??
    call.remotes[0];

  return (
    <View style={StyleSheet.absoluteFill} className="bg-black">
      {featured?.videoOn ? (
        <ZoomView
          style={StyleSheet.absoluteFill}
          userId={featured.userId}
          videoAspect={VideoAspect.PanAndScan}
          videoResolution={resolutionFor(call)}
        />
      ) : (
        <View className="flex-1 items-center justify-center gap-4 bg-neutral-900">
          <View className="size-28 items-center justify-center rounded-full bg-white/10">
            <Text className="text-4xl font-bold text-white">
              {initials(featured?.name ?? name ?? '')}
            </Text>
          </View>
          <View className="items-center gap-1">
            <Text className="text-lg font-semibold text-white">
              {featured?.name ?? (name ? drName(name) : '')}
            </Text>
            {featured ? (
              <View className="flex-row items-center gap-1.5">
                <Icon as={VideoOff} className="size-3.5 text-white/60" />
                <Text className="text-[13px] text-white/60">
                  {call.audioOnly || call.downlink === 'poor'
                    ? 'Audio only to keep the call clear'
                    : 'Camera is off'}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      )}
    </View>
  );
}

// You, in the corner. Only shown while your camera is on.
export function SelfView({ call, top }: { call: CallState; top: number }) {
  if (!call.isVideoOn || !call.selfId) return null;
  return (
    <View
      className="absolute right-4 overflow-hidden rounded-2xl border border-white/25 bg-black"
      style={{ top, width: 104, height: 148 }}>
      <ZoomView
        style={StyleSheet.absoluteFill}
        userId={call.selfId}
        videoAspect={VideoAspect.PanAndScan}
        videoResolution={VideoResolution.Resolution180P}
      />
    </View>
  );
}
