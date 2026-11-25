import { ActionButton } from '@/components/shared/action-button';
import { Text } from '@/components/ui/text';
import { goToMain } from '@/lib/navigation';
import { NativeModules, View } from 'react-native';

// Zoom's video code is native. Expo Go doesn't have it, so say so instead of failing.
const hasVideo = Boolean(NativeModules.RNZoomVideoSdk);

export default function CallRoute() {
  if (!hasVideo) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-background px-8">
        <Text className="text-center text-2xl font-semibold">Video calls need the full app</Text>
        <Text className="text-center text-[15px] leading-6 text-muted-foreground">
          This build can't run video calls. Install the NairaClinic development build, then open the
          consultation again.
        </Text>
        <ActionButton size="md" label="Back" onPress={() => goToMain('/home')} />
      </View>
    );
  }
  const { CallScreen } = require('@/features/call/screens/call-screen');
  return <CallScreen />;
}
