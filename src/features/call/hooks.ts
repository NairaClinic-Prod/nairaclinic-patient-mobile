import { callApi, type HandoverRequest } from '@/api/call';
import { ApiError } from '@/api/client';
import { consultationsApi } from '@/api/consultations';
import { API_URL } from '@/lib/env';
import { accessToken } from '@/lib/auth/session';
import {
  EventType,
  SessionLeaveReason,
  ZoomVideoSDKDataType,
  useZoom,
  type ZoomVideoSdkUser,
} from '@zoom/react-native-videosdk';
import * as React from 'react';
import { PermissionsAndroid, Platform, type Permission } from 'react-native';
import { io } from 'socket.io-client';
import {
  GOOD_BEFORE_VIDEO_BACK,
  POOR_BEFORE_AUDIO_ONLY,
  qualityOf,
  useDeviceNetwork,
  useOnReconnect,
  type LinkQuality,
} from './network';
import { SEAT_MOVED, deviceLabel, seatId } from './seat';

export type CallPhase =
  | 'waiting'
  | 'joining'
  | 'connected'
  | 'reconnecting'
  | 'awaiting-approval'
  | 'declined'
  | 'moved'
  | 'ended'
  | 'failed';

export type Remote = {
  userId: string;
  name: string;
  videoOn: boolean;
  muted: boolean;
  reconnecting: boolean;
};

export type Notice = { id: number; text: string; tone: 'info' | 'warning' };

const HEARTBEAT_MS = 15_000;
const HANDOVER_POLL_MS = 3_000;
const PENDING_POLL_MS = 4_000;
const WAITING_POLL_MS = 3_000;
const NOTICE_MS = 7_000;
const MAX_AUTO_REJOINS = 3;

async function askPermissions(): Promise<string | null> {
  if (Platform.OS !== 'android') return null;
  const wanted: Permission[] = [
    PermissionsAndroid.PERMISSIONS.CAMERA,
    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
  ];
  if (Number(Platform.Version) >= 31) wanted.push(PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT);
  const result = await PermissionsAndroid.requestMultiple(wanted);
  if (result[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] !== 'granted') {
    return 'Allow microphone access in your phone settings, then try again.';
  }
  return null;
}

function describe(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 0) return "Can't reach NairaClinic. Check your connection and try again.";
    return error.message;
  }
  return error instanceof Error && error.message
    ? error.message
    : 'We could not join the call. Please try again.';
}

// Everything about being in a call: waiting for the doctor, joining, the seat on this device, how the
// network is doing, and what to do about it. The screen only draws what this says.
export function useCall(consultationId: string, displayName?: string) {
  const zoom = useZoom();
  const { addListener } = zoom;
  const network = useDeviceNetwork();
  const sessionId = React.useMemo(() => seatId(consultationId), [consultationId]);

  const [phase, setPhase] = React.useState<CallPhase>('waiting');
  const [error, setError] = React.useState<string | null>(null);
  const [remotes, setRemotes] = React.useState<Remote[]>([]);
  const [selfId, setSelfId] = React.useState<string | null>(null);
  const [isAudioOn, setIsAudioOn] = React.useState(true);
  const [isVideoOn, setIsVideoOn] = React.useState(false);
  const [speakerOn, setSpeakerOn] = React.useState(true);
  const [activeSpeaker, setActiveSpeaker] = React.useState<string | null>(null);
  const [uplink, setUplink] = React.useState<LinkQuality>('unknown');
  const [downlink, setDownlink] = React.useState<LinkQuality>('unknown');
  const [audioOnly, setAudioOnly] = React.useState(false);
  const [connectedAt, setConnectedAt] = React.useState<number | null>(null);
  const [notices, setNotices] = React.useState<Notice[]>([]);
  const [handover, setHandover] = React.useState<HandoverRequest | null>(null);
  const [waitingRequest, setWaitingRequest] = React.useState<string | null>(null);
  const [doctorName, setDoctorName] = React.useState<string | null>(null);

  const refs = React.useRef({
    joining: false,
    connected: false,
    leaving: false,
    leftByUser: false,
    wantsVideo: true,
    audioOnly: false,
    poor: 0,
    good: 0,
    approved: null as string | null,
    selfId: null as string | null,
    customId: '',
    rejoins: 0,
    noticeId: 0,
    seatTaken: false,
  });
  const latest = React.useRef({
    join: () => Promise.resolve(),
    yieldSeat: () => Promise.resolve(),
  });

  const notify = React.useCallback((text: string, tone: Notice['tone'] = 'info') => {
    const id = ++refs.current.noticeId;
    setNotices((list) => [...list.slice(-2), { id, text, tone }]);
    setTimeout(() => setNotices((list) => list.filter((item) => item.id !== id)), NOTICE_MS);
  }, []);

  const refreshUsers = React.useCallback(async () => {
    try {
      const me = await zoom.session.getMySelf();
      refs.current.selfId = me.userId;
      refs.current.customId = me.customUserId ?? '';
      setSelfId(me.userId);
      const mine = me as unknown as ZoomVideoSdkUser;
      setIsVideoOn(await mine.videoStatus.isOn());
      setIsAudioOn(!(await mine.audioStatus.isMuted()));
      const others = await zoom.session.getRemoteUsers();
      const mapped = await Promise.all(
        others.map(async (user: ZoomVideoSdkUser) => ({
          userId: user.userId,
          name: user.userName,
          videoOn: await user.videoStatus.isOn(),
          muted: await user.audioStatus.isMuted(),
          reconnecting: await user.getIsInFailover().catch(() => false),
        }))
      );
      setRemotes(mapped);
    } catch {
      // the next event refreshes it again
    }
  }, [zoom]);

  // --- seat -----------------------------------------------------------------------------------

  const stopCall = React.useCallback(
    async (end = false) => {
      refs.current.leaving = true;
      refs.current.connected = false;
      try {
        await zoom.leaveSession(end);
      } catch {
        // already out
      }
      setRemotes([]);
      setConnectedAt(null);
    },
    [zoom]
  );

  // Another device took this seat: step out without ending the call for the doctor.
  const yieldSeat = React.useCallback(async () => {
    if (refs.current.leaving) return;
    await stopCall(false);
    setError('You joined this consultation on another device.');
    setPhase('moved');
  }, [stopCall]);
  latest.current.yieldSeat = yieldSeat;

  // The device in the call answers a takeover request. Allowing it hands the call over and leaves.
  const answerHandover = React.useCallback(
    async (decision: 'accept' | 'reject') => {
      const request = handover;
      if (!request) return;
      setHandover(null);
      try {
        await callApi.answerHandover(consultationId, request.requestId, decision, sessionId);
        if (decision === 'accept') {
          await yieldSeat();
          setError('You moved this call to your other device.');
        }
      } catch (failure) {
        notify(
          failure instanceof Error ? failure.message : "We couldn't send your answer.",
          'warning'
        );
      }
    },
    [consultationId, handover, notify, sessionId, yieldSeat]
  );

  // --- joining --------------------------------------------------------------------------------

  const join = React.useCallback(async () => {
    const state = refs.current;
    if (state.joining || state.connected) return;
    state.joining = true;
    state.leaving = false;
    state.leftByUser = false;
    setError(null);
    setPhase('joining');
    try {
      const denied = await askPermissions();
      if (denied) throw new Error(denied);
      const session = await callApi.token(consultationId, {
        sessionId,
        device: deviceLabel(),
        ...(displayName ? { displayName } : {}),
        ...(state.approved ? { requestId: state.approved } : {}),
      });
      state.seatTaken = Boolean(session.seatTakenOver);
      state.approved = null;
      await zoom.joinSession({
        sessionName: session.topic,
        token: session.token,
        userName: session.userName,
        // Audio first. On a slow phone connection the camera starts off and comes on when it's safe.
        audioOptions: { connect: true, mute: false },
        videoOptions: { localVideoOn: state.wantsVideo && !network.slow },
        sessionIdleTimeoutMins: 40,
      });
    } catch (failure) {
      if (
        failure instanceof ApiError &&
        failure.status === 409 &&
        failure.code === 'SEAT_APPROVAL_NEEDED'
      ) {
        const requestId = (failure.data as { requestId?: string } | undefined)?.requestId;
        if (requestId) {
          setWaitingRequest(requestId);
          setPhase('awaiting-approval');
          state.joining = false;
          return;
        }
      }
      setError(describe(failure));
      setPhase('failed');
    } finally {
      state.joining = false;
    }
  }, [consultationId, displayName, network.slow, sessionId, zoom]);
  latest.current.join = join;

  const leave = React.useCallback(async () => {
    refs.current.leftByUser = true;
    await stopCall(false);
    callApi.presence(consultationId, 'left', sessionId).catch(() => undefined);
    setPhase('ended');
  }, [consultationId, sessionId, stopCall]);

  // --- controls -------------------------------------------------------------------------------

  const toggleAudio = React.useCallback(async () => {
    const id = refs.current.selfId;
    if (!id) return;
    if (isAudioOn) await zoom.audioHelper.muteAudio(id);
    else await zoom.audioHelper.unmuteAudio(id);
    setIsAudioOn(!isAudioOn);
  }, [isAudioOn, zoom]);

  const toggleVideo = React.useCallback(async () => {
    if (isVideoOn) {
      refs.current.wantsVideo = false;
      await zoom.videoHelper.stopVideo();
      setIsVideoOn(false);
    } else {
      refs.current.wantsVideo = true;
      refs.current.audioOnly = false;
      setAudioOnly(false);
      await zoom.videoHelper.startVideo();
      setIsVideoOn(true);
    }
  }, [isVideoOn, zoom]);

  const flipCamera = React.useCallback(async () => {
    await zoom.videoHelper.switchCamera();
  }, [zoom]);

  const toggleSpeaker = React.useCallback(async () => {
    await zoom.audioHelper.setSpeaker(!speakerOn);
    setSpeakerOn(!speakerOn);
  }, [speakerOn, zoom]);

  // --- Zoom events ----------------------------------------------------------------------------

  React.useEffect(() => {
    const subs = [
      addListener(EventType.onSessionJoin, async () => {
        const state = refs.current;
        state.connected = true;
        state.rejoins = 0;
        setConnectedAt(Date.now());
        setPhase('connected');
        setError(null);
        await refreshUsers();
        zoom.audioHelper.setSpeaker(true).catch(() => undefined);
        callApi.presence(consultationId, 'joined', sessionId).catch(() => undefined);
        if (state.seatTaken) {
          const message = JSON.stringify({ t: SEAT_MOVED, sid: sessionId });
          zoom.cmdChannel.sendCommand('', message).catch(() => undefined);
        }
      }),
      addListener(EventType.onSessionLeave, ({ reason }) => {
        const state = refs.current;
        state.connected = false;
        if (state.leaving || state.leftByUser) return;
        setRemotes([]);
        setConnectedAt(null);
        if (reason === SessionLeaveReason.EndByHost) setPhase('ended');
        else {
          setError('You dropped out of the call. Rejoining as soon as your connection is back.');
          setPhase('failed');
        }
      }),
      addListener(EventType.onUserJoin, async ({ remoteUsers }) => {
        await refreshUsers();
        remoteUsers?.forEach((user) => notify(`${user.userName} joined the call.`));
      }),
      addListener(EventType.onUserLeave, async ({ remoteUsers }) => {
        await refreshUsers();
        remoteUsers?.forEach((user) => notify(`${user.userName} left the call.`, 'warning'));
      }),
      addListener(EventType.onUserVideoStatusChanged, refreshUsers),
      addListener(EventType.onUserAudioStatusChanged, refreshUsers),
      addListener(EventType.onUserActiveAudioChanged, ({ changedUsers }) => {
        const loudest = changedUsers.find((user) => user.userId !== refs.current.selfId);
        if (loudest) setActiveSpeaker(loudest.userId);
      }),
      addListener(EventType.onUserNetworkStatusChanged, ({ type, status, user }) => {
        if (type === ZoomVideoSDKDataType.Share) return;
        const level = qualityOf(status);
        const state = refs.current;
        if (user.userId !== state.selfId) {
          if (type === ZoomVideoSDKDataType.Video) setDownlink(level);
          return;
        }
        setUplink(level);
        if (level === 'poor') {
          state.poor += 1;
          state.good = 0;
          if (state.poor >= POOR_BEFORE_AUDIO_ONLY && !state.audioOnly) {
            state.audioOnly = true;
            setAudioOnly(true);
            zoom.videoHelper.stopVideo().catch(() => undefined);
            setIsVideoOn(false);
            notify('Weak connection: your video is paused so the audio stays clear.', 'warning');
          }
        } else if (level === 'good') {
          state.good += 1;
          state.poor = 0;
          if (state.good >= GOOD_BEFORE_VIDEO_BACK && state.audioOnly) {
            state.audioOnly = false;
            setAudioOnly(false);
            if (state.wantsVideo) {
              zoom.videoHelper.startVideo().catch(() => undefined);
              setIsVideoOn(true);
              notify('Connection is back. Your video is on again.');
            }
          }
        }
      }),
      addListener(EventType.onCommandReceived, async ({ sender, command }) => {
        let message: { t?: string; sid?: string } | null = null;
        try {
          message = JSON.parse(command);
        } catch {
          return;
        }
        if (message?.t !== SEAT_MOVED || !message.sid || message.sid === sessionId) return;
        const others = await zoom.session.getRemoteUsers();
        const from = others.find((user: ZoomVideoSdkUser) => user.userId === sender);
        if (from?.customUserId && from.customUserId === refs.current.customId)
          await latest.current.yieldSeat();
      }),
      addListener(EventType.onError, ({ errorType }) => {
        if (refs.current.connected)
          notify(
            `Call problem: ${String(errorType).replace(/^ZoomVideoSDKError_/, '')}`,
            'warning'
          );
      }),
    ];
    return () => subs.forEach((subscription) => subscription.remove());
  }, [addListener, consultationId, notify, refreshUsers, sessionId, zoom]);

  // --- the doctor's room ----------------------------------------------------------------------

  // Wait here until the doctor is in the call, then go in by ourselves.
  React.useEffect(() => {
    if (phase !== 'waiting') return;
    let stopped = false;
    const check = async () => {
      try {
        const { consultation, doctor } = await consultationsApi.detail(consultationId);
        if (stopped) return;
        if (doctor?.name) setDoctorName(doctor.name);
        if (['completed', 'cancelled', 'ended'].includes(consultation.status)) {
          setPhase('ended');
          return;
        }
        const presence = consultation.metaJson?.presence ?? {};
        const joined = presence.doctorLastJoinedAtUtc ?? presence.doctorJoinedAtUtc;
        const left = presence.doctorLastLeftAtUtc ?? presence.doctorLeftAtUtc;
        const joinedAt = joined ? Date.parse(joined) : null;
        const leftAt = left ? Date.parse(left) : null;
        if (joinedAt !== null && (leftAt === null || leftAt < joinedAt)) void latest.current.join();
      } catch {
        // try again on the next beat
      }
    };
    void check();
    const timer = setInterval(check, WAITING_POLL_MS);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [consultationId, phase]);

  // --- keeping the seat -----------------------------------------------------------------------

  const inCall = phase === 'connected' || phase === 'reconnecting';

  React.useEffect(() => {
    if (!inCall) return;
    const ping = async () => {
      try {
        const reply = await callApi.presence(consultationId, 'ping', sessionId);
        if (reply.seatMoved && refs.current.connected) await latest.current.yieldSeat();
        const asked = reply.handoverRequest;
        if (asked?.requestId) {
          setHandover(
            (current) =>
              current ?? { requestId: asked.requestId!, device: asked.device || 'another device' }
          );
        }
      } catch {
        // a missed beat is fine
      }
    };
    const timer = setInterval(ping, HEARTBEAT_MS);
    return () => clearInterval(timer);
  }, [consultationId, inCall, sessionId]);

  // The device in the call also checks for takeover requests, in case the live connection is down.
  React.useEffect(() => {
    if (!inCall) return;
    let stopped = false;
    const check = async () => {
      try {
        const { request } = await callApi.handoverPending(consultationId, sessionId);
        if (!stopped && request?.requestId) {
          setHandover(
            (current) =>
              current ?? {
                requestId: request.requestId!,
                device: request.device || 'another device',
              }
          );
        }
      } catch {
        // try again soon
      }
    };
    const timer = setInterval(check, PENDING_POLL_MS);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [consultationId, inCall, sessionId]);

  // Live seat events from the server, so a takeover request shows up at once.
  React.useEffect(() => {
    let socket: ReturnType<typeof io> | null = null;
    let stopped = false;
    (async () => {
      try {
        const token = await accessToken();
        if (stopped) return;
        socket = io(`${API_URL.replace(/\/api(\/v\d+)?$/, '')}/live`, {
          auth: { token },
          transports: ['websocket', 'polling'],
        });
        socket.on(
          'call-seat',
          (event: {
            type?: string;
            consultationId?: string;
            requestId?: string;
            toSessionId?: string;
            device?: string;
            decision?: string;
          }) => {
            if (event.consultationId !== consultationId || !event.requestId) return;
            if (
              event.type === 'handover-request' &&
              event.toSessionId === sessionId &&
              refs.current.connected
            ) {
              setHandover({ requestId: event.requestId, device: event.device || 'another device' });
            }
            if (event.type === 'handover-decided') settle(event.requestId, event.decision ?? '');
          }
        );
      } catch {
        // polling covers it
      }
    })();
    return () => {
      stopped = true;
      socket?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consultationId, sessionId]);

  // The asking device: the other device said yes, no, or nothing.
  const settle = React.useCallback(
    (requestId: string, decision: string) => {
      setHandover((current) => (current?.requestId === requestId ? null : current));
      if (waitingRequest !== requestId) return;
      setWaitingRequest(null);
      if (decision === 'accepted') {
        refs.current.approved = requestId;
        void latest.current.join();
      } else {
        setPhase('declined');
        setError(
          decision === 'rejected'
            ? 'Your other device chose to stay in the call.'
            : "Your other device didn't answer. Try again, or leave the call on that device first."
        );
      }
    },
    [waitingRequest]
  );

  React.useEffect(() => {
    if (!waitingRequest) return;
    let stopped = false;
    const check = async () => {
      try {
        const reply = await callApi.handoverStatus(consultationId, waitingRequest);
        if (!stopped && reply.status && reply.status !== 'pending') {
          settle(waitingRequest, reply.status === 'unknown' ? 'expired' : reply.status);
        }
      } catch {
        // try again soon
      }
    };
    const timer = setInterval(check, HANDOVER_POLL_MS);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [consultationId, settle, waitingRequest]);

  // --- the phone's own connection -------------------------------------------------------------

  // Offline is shown straight away; coming back rejoins by itself, a few times, if the call dropped.
  React.useEffect(() => {
    if (!network.online && refs.current.connected) setPhase('reconnecting');
    else if (network.online && phase === 'reconnecting' && refs.current.connected)
      setPhase('connected');
  }, [network.online, phase]);

  useOnReconnect(() => {
    if (phase === 'failed' && !refs.current.leftByUser && refs.current.rejoins < MAX_AUTO_REJOINS) {
      refs.current.rejoins += 1;
      void latest.current.join();
    }
  });

  // Never leave the call running if the screen goes away.
  React.useEffect(
    () => () => {
      if (refs.current.connected || refs.current.joining) {
        refs.current.leftByUser = true;
        zoom.leaveSession(false);
        callApi.presence(consultationId, 'left', sessionId).catch(() => undefined);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return {
    phase,
    error,
    remotes,
    selfId,
    isAudioOn,
    isVideoOn,
    speakerOn,
    activeSpeaker,
    uplink,
    downlink,
    audioOnly,
    connectedAt,
    notices,
    handover,
    doctorName,
    online: network.online,
    slow: network.slow,
    join,
    leave,
    toggleAudio,
    toggleVideo,
    flipCamera,
    toggleSpeaker,
    answerHandover,
    cancelWaiting: () => {
      setWaitingRequest(null);
      setPhase('waiting');
      setError(null);
    },
    dismissNotice: (id: number) => setNotices((list) => list.filter((item) => item.id !== id)),
  };
}

export type CallState = ReturnType<typeof useCall>;
