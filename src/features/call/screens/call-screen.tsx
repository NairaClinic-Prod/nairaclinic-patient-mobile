import { callApi } from '@/api/call';
import { ActionButton } from '@/components/shared/action-button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { drName, initials } from '@/features/home/utils';
import { goToMain } from '@/lib/navigation';
import { ZoomVideoSdkProvider } from '@zoom/react-native-videosdk';
import { useKeepAwake } from 'expo-keep-awake';
import { useLocalSearchParams } from 'expo-router';
import { Star } from 'lucide-react-native';
import * as React from 'react';
import { ActivityIndicator, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CallControls } from '../components/call-controls';
import { CallStatus, Notices } from '../components/status-bar';
import { Reconnecting, SelfView, VideoStage } from '../components/video-stage';
import { useCall, type CallState } from '../hooks';

const SDK_CONFIG = { domain: 'zoom.us', enableLog: false, preferVideoResolution: '720P' as const };

function Page({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      className="flex-1 bg-neutral-950 px-6"
      style={{ paddingTop: insets.top + 24, paddingBottom: Math.max(insets.bottom, 16) + 8 }}>
      {children}
    </View>
  );
}

function Message({
  title,
  text,
  children,
}: {
  title: string;
  text?: string | null;
  children?: React.ReactNode;
}) {
  return (
    <Page>
      <View className="flex-1 items-center justify-center gap-3 px-2">
        <Text className="text-center text-[26px] leading-8 font-semibold tracking-tight text-white">
          {title}
        </Text>
        {text ? (
          <Text className="text-center text-[15px] leading-6 text-white/65">{text}</Text>
        ) : null}
      </View>
      <View className="gap-2.5">{children}</View>
    </Page>
  );
}

// Before the doctor is in: a calm screen, no spinner theatre. The call starts by itself.
function Waiting({ call }: { call: CallState }) {
  const name = call.doctorName ? drName(call.doctorName) : 'your doctor';
  return (
    <Page>
      <View className="flex-1 items-center justify-center gap-5">
        <View className="size-24 items-center justify-center rounded-full bg-white/10">
          <Text className="text-3xl font-bold text-white">{initials(call.doctorName ?? '')}</Text>
        </View>
        <View className="items-center gap-1.5">
          <Text className="text-[26px] font-semibold tracking-tight text-white">{`Waiting for ${name}`}</Text>
          <Text className="text-center text-[15px] leading-6 text-white/65">
            {call.online
              ? "You'll join automatically as soon as they're in."
              : "You're offline. We'll keep waiting once you're back online."}
          </Text>
        </View>
        <ActivityIndicator color="#ffffff" />
      </View>
      <ActionButton size="md" variant="outline" label="Leave" onPress={() => goToMain('/home')} />
    </Page>
  );
}

function Rating({ id }: { id: string }) {
  const [stars, setStars] = React.useState(0);
  const [review, setReview] = React.useState('');
  const [busy, setBusy] = React.useState(false);

  async function submit() {
    setBusy(true);
    await callApi
      .rate(id, { rating: stars, ...(review.trim() ? { review: review.trim() } : {}) })
      .catch(() => undefined);
    goToMain('/home');
  }

  return (
    <Message title="Call ended" text="How was your consultation?">
      <View className="items-center gap-4 pb-4">
        <View className="flex-row gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <Icon
              key={value}
              as={Star}
              onPress={() => setStars(value)}
              className={
                value <= stars ? 'size-10 fill-amber-400 text-amber-400' : 'size-10 text-white/35'
              }
            />
          ))}
        </View>
        {stars ? (
          <TextInput
            value={review}
            onChangeText={setReview}
            placeholder="Tell us more (optional)"
            placeholderTextColor="rgba(255,255,255,0.4)"
            multiline
            maxLength={500}
            className="min-h-20 w-full rounded-2xl bg-white/10 px-4 py-3 text-[15px] text-white"
          />
        ) : null}
      </View>
      {stars ? (
        <ActionButton
          size="md"
          label={busy ? 'Sending…' : 'Send rating'}
          disabled={busy}
          onPress={submit}
        />
      ) : null}
      <ActionButton
        size="md"
        variant="outline"
        label={stars ? 'Skip' : 'Done'}
        onPress={() => goToMain('/home')}
      />
    </Message>
  );
}

// The device already in the call is asked, and decides, who keeps the seat.
function SeatPrompt({ call }: { call: CallState }) {
  if (!call.handover) return null;
  return (
    <View className="absolute inset-x-4 bottom-40 gap-3 rounded-3xl bg-neutral-900 p-5">
      <Text className="text-[17px] font-semibold text-white">Move this call?</Text>
      <Text className="text-[14px] leading-5 text-white/70">
        {`Your ${call.handover.device} wants to join this consultation. If you allow it, this phone leaves the call.`}
      </Text>
      <View className="flex-row gap-2">
        <View className="flex-1">
          <ActionButton
            size="md"
            variant="outline"
            label="Stay here"
            onPress={() => call.answerHandover('reject')}
          />
        </View>
        <View className="flex-1">
          <ActionButton size="md" label="Move it" onPress={() => call.answerHandover('accept')} />
        </View>
      </View>
    </View>
  );
}

function InCall({ call }: { call: CallState }) {
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-black">
      <VideoStage call={call} name={call.doctorName} />
      <Reconnecting call={call} />
      <View style={{ paddingTop: insets.top + 12 }} className="gap-3 px-4">
        <CallStatus
          call={call}
          title={call.doctorName ? drName(call.doctorName) : 'Consultation'}
        />
        <Notices call={call} />
      </View>
      <SelfView call={call} top={insets.top + 88} />
      <View className="flex-1" />
      <View style={{ paddingBottom: Math.max(insets.bottom, 16) + 8 }} className="px-4">
        <CallControls call={call} />
      </View>
      <SeatPrompt call={call} />
    </View>
  );
}

function CallBody({ id }: { id: string }) {
  useKeepAwake();
  const call = useCall(id);

  switch (call.phase) {
    case 'waiting':
      return <Waiting call={call} />;
    case 'joining':
      return (
        <Page>
          <View className="flex-1 items-center justify-center gap-4">
            <ActivityIndicator color="#ffffff" />
            <Text className="text-[17px] font-medium text-white">Joining the call…</Text>
          </View>
        </Page>
      );
    case 'awaiting-approval':
      return (
        <Message
          title="Approve on your other device"
          text="This consultation is open on another device of yours. Allow the move there, and the call starts here.">
          <ActionButton size="md" variant="outline" label="Cancel" onPress={call.cancelWaiting} />
        </Message>
      );
    case 'declined':
      return (
        <Message title="Couldn't take over" text={call.error}>
          <ActionButton size="md" label="Try again" onPress={call.join} />
          <ActionButton
            size="md"
            variant="outline"
            label="Back"
            onPress={() => goToMain('/home')}
          />
        </Message>
      );
    case 'moved':
      return (
        <Message title="Call moved" text={call.error}>
          <ActionButton size="md" label="Done" onPress={() => goToMain('/home')} />
        </Message>
      );
    case 'failed':
      return (
        <Message title="You dropped out" text={call.error}>
          <ActionButton size="md" label="Rejoin" onPress={call.join} />
          <ActionButton
            size="md"
            variant="outline"
            label="Leave"
            onPress={() => goToMain('/home')}
          />
        </Message>
      );
    case 'ended':
      return <Rating id={id} />;
    default:
      return <InCall call={call} />;
  }
}

export function CallScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  if (!id) return null;
  return (
    <ZoomVideoSdkProvider config={SDK_CONFIG}>
      <CallBody id={id} />
    </ZoomVideoSdkProvider>
  );
}
