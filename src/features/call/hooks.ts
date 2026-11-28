import { callApi, type HandoverRequest } from '@/api/call';
import { ApiError } from '@/api/client';
import { consultationsApi } from '@/api/consultations';
import { API_URL } from '@/lib/env';
import { accessToken } from '@/lib/auth/session';
import {
  EventType,
  SessionLeaveReason,
  VideoPreferenceMode,
  ZoomVideoSDKDataType,
  useZoom,
  type ZoomVideoSdkUser,
} from '@zoom/react-native-videosdk';
import * as React from 'react';
import { AppState, PermissionsAndroid, Platform, type Permission } from 'react-native';
import { io } from 'socket.io-client';
import { qualityOf, useDeviceNetwork, useOnReconnect, type LinkQuality } from './network';
import {
  SAMPLE_MS,
  VIDEO_PREFERENCE,
  climb,
  firstTier,
  judge,
  startLadder,
  type Ladder,
  type Tier,
  type Verdict,
} from './quality';
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
const REJOIN_DELAYS_MS = [1_000, 2_000, 4_000, 8_000, 10_000];
const REJOIN_FOR_MS = 120_000;

type Stats = Record<string, number | undefined> | null | undefined;
const num = (stats: Stats, key: string) => {
  const value = stats?.[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
};
const shortSide = (stats: Stats, prefix: 'send' | 'recv') => {
  const width = num(stats, `${prefix}FrameWidth`);
  const height = num(stats, `${prefix}FrameHeight`);
  return width && height ? Math.min(width, height) : 0;
};
const linkOf = (verdict: Verdict): LinkQuality => verdict;

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
  const [sendTier, setSendTier] = React.useState<Tier>('hd');
  const [recvTier, setRecvTier] = React.useState<Tier>('hd');
  const [receivingP, setReceivingP] = React.useState(0);
  const [sendingP, setSendingP] = React.useState(0);
  const [remoteWeak, setRemoteWeak] = React.useState(false);
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
    videoOn: false,
    send: startLadder('hd', 0),
    recv: startLadder('hd', 0),
    selfNet: 'unknown' as LinkQuality,
    approved: null as string | null,
    selfId: null as string | null,
    customId: '',
    rejoins: 0,
    droppedAt: null as number | null,
    rejoinTimer: null as ReturnType<typeof setTimeout> | null,
    backgrounded: false,
    resumeVideo: false,
    online: true,
    noticeId: 0,
    seatTaken: false,
    startTier: 'hd' as Tier,
  });
  refs.current.online = network.online;
  const latest = React.useRef({
    join: (_quiet?: boolean) => Promise.resolve(),
    yieldSeat: () => Promise.resolve(),
    scheduleRejoin: () => undefined as void,
    settle: (_requestId: string, _decision: string) => undefined as void,
    waiting: null as string | null,
  });
  const socketRef = React.useRef<ReturnType<typeof io> | null>(null);
  const isAudioOnRef = React.useRef(true);
  isAudioOnRef.current = isAudioOn;

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
      const videoOn = await mine.videoStatus.isOn();
      refs.current.videoOn = videoOn;
      setIsVideoOn(videoOn);
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
      if (refs.current.rejoinTimer) clearTimeout(refs.current.rejoinTimer);
      refs.current.rejoinTimer = null;
      refs.current.droppedAt = null;
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

  // --- picture quality ------------------------------------------------------------------------

  const setVideo = React.useCallback(
    async (on: boolean) => {
      refs.current.videoOn = on;
      setIsVideoOn(on);
      if (on) await zoom.videoHelper.startVideo().catch(() => undefined);
      else await zoom.videoHelper.stopVideo().catch(() => undefined);
    },
    [zoom]
  );

  // tells zoom how much picture to send for this tier, or pauses the camera to save the audio
  const applySendTier = React.useCallback(
    async (tier: Tier, previous: Tier) => {
      const state = refs.current;
      setSendTier(tier);
      if (tier === 'audio') {
        state.audioOnly = true;
        setAudioOnly(true);
        if (state.videoOn) {
          await setVideo(false);
          notify('Weak connection: your video is paused so your voice stays clear.', 'warning');
        }
        return;
      }
      const { min, max } = VIDEO_PREFERENCE[tier];
      await zoom.videoHelper
        .setVideoQualityPreference({
          mode: VideoPreferenceMode.Custom,
          minimumFrameRate: min,
          maximumFrameRate: max,
        })
        .catch(() => undefined);
      if (previous === 'audio') {
        state.audioOnly = false;
        setAudioOnly(false);
        if (state.wantsVideo && !state.backgrounded && !state.videoOn) {
          await setVideo(true);
          notify('Connection is better. Your video is back on.');
        }
      }
    },
    [notify, setVideo, zoom]
  );

  const applyRecvTier = React.useCallback(
    (tier: Tier, previous: Tier) => {
      setRecvTier(tier);
      if (tier === 'audio')
        notify("Weak connection: the doctor's video is paused so you can hear clearly.", 'warning');
      else if (previous === 'audio') notify("Connection is better. The doctor's video is back.");
    },
    [notify]
  );

  const resetLadders = React.useCallback(
    (tier: Tier) => {
      const now = Date.now();
      const state = refs.current;
      const sendBefore = state.send.tier;
      const recvBefore = state.recv.tier;
      state.send = startLadder(tier, now);
      state.recv = startLadder(tier, now);
      void applySendTier(tier, sendBefore);
      if (recvBefore !== tier) applyRecvTier(tier, recvBefore);
    },
    [applyRecvTier, applySendTier]
  );

  // --- joining --------------------------------------------------------------------------------

  // after a drop, keep trying to get back in for two minutes, waiting a little longer each time
  const scheduleRejoin = React.useCallback(() => {
    const state = refs.current;
    if (state.leftByUser) return;
    if (state.rejoinTimer) clearTimeout(state.rejoinTimer);
    state.droppedAt ??= Date.now();
    if (Date.now() - state.droppedAt > REJOIN_FOR_MS) {
      state.droppedAt = null;
      setError("We couldn't get you back into the call. Check your connection and tap Rejoin.");
      setPhase('failed');
      return;
    }
    const delay = REJOIN_DELAYS_MS[Math.min(state.rejoins, REJOIN_DELAYS_MS.length - 1)]!;
    state.rejoins += 1;
    setPhase('reconnecting');
    state.rejoinTimer = setTimeout(() => {
      state.rejoinTimer = null;
      if (state.online) void latest.current.join(true);
      else latest.current.scheduleRejoin();
    }, delay);
  }, []);

  const join = React.useCallback(
    async (quiet = false) => {
      const state = refs.current;
      if (state.joining || state.connected) return;
      state.joining = true;
      state.leaving = false;
      state.leftByUser = false;
      setError(null);
      if (!quiet) {
        state.droppedAt = null;
        state.rejoins = 0;
        setPhase('joining');
      }
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
        const start = quiet ? state.send.tier : firstTier(network);
        state.startTier = start;
        await zoom.joinSession({
          sessionName: session.topic,
          token: session.token,
          userName: session.userName,
          // Audio first. On a slow phone connection the camera starts off and comes on when it's safe.
          audioOptions: {
            connect: true,
            mute: !isAudioOnRef.current,
            autoAdjustSpeakerVolume: true,
          },
          videoOptions: { localVideoOn: state.wantsVideo && start !== 'audio' && !network.slow },
          sessionIdleTimeoutMins: 40,
        });
      } catch (failure) {
        if (quiet && !(failure instanceof ApiError && failure.status === 409)) {
          state.joining = false;
          scheduleRejoin();
          return;
        }
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
    },
    [consultationId, displayName, network, scheduleRejoin, sessionId, zoom]
  );
  latest.current.join = join;
  latest.current.scheduleRejoin = scheduleRejoin;

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
    const state = refs.current;
    if (isVideoOn) {
      state.wantsVideo = false;
      await setVideo(false);
      return;
    }
    state.wantsVideo = true;
    if (state.send.tier === 'audio') {
      const before = state.send.tier;
      state.send = startLadder('low', Date.now());
      await applySendTier('low', before);
    }
    await setVideo(true);
  }, [applySendTier, isVideoOn, setVideo]);

  const flipCamera = React.useCallback(async () => {
    await zoom.videoHelper.switchCamera();
  }, [zoom]);

  const speakerOnRef = React.useRef(speakerOn);
  speakerOnRef.current = speakerOn;

  const toggleSpeaker = React.useCallback(async () => {
    await zoom.audioHelper.setSpeaker(!speakerOn);
    setSpeakerOn(!speakerOn);
  }, [speakerOn, zoom]);

  // --- Zoom events ----------------------------------------------------------------------------

  React.useEffect(() => {
    const subs = [
      addListener(EventType.onSessionJoin, async () => {
        const state = refs.current;
        const rejoined = state.droppedAt !== null;
        state.connected = true;
        state.rejoins = 0;
        state.droppedAt = null;
        if (state.rejoinTimer) clearTimeout(state.rejoinTimer);
        state.rejoinTimer = null;
        setConnectedAt((since) => (rejoined && since ? since : Date.now()));
        setPhase('connected');
        setError(null);
        if (rejoined) notify("You're back in the call.");
        // keep zoom's noise and echo removal on, and let it level the mic
        zoom.audioSettingHelper.enableMicOriginalInput(false).catch(() => undefined);
        zoom.audioSettingHelper.enableAutoAdjustMicVolume(true).catch(() => undefined);
        await refreshUsers();
        if (rejoined) void applySendTier(state.send.tier, state.send.tier);
        else resetLadders(state.startTier);
        zoom.audioHelper.setSpeaker(speakerOnRef.current).catch(() => undefined);
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
        else if (reason === SessionLeaveReason.KickByHost) {
          setError('The doctor removed you from the call.');
          setPhase('failed');
        } else latest.current.scheduleRejoin();
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
        if (user.userId === refs.current.selfId) refs.current.selfNet = level;
        else setRemoteWeak(level === 'poor');
      }),
      addListener(EventType.onUserFailoverStatusChanged, ({ user, isInFailover }) => {
        if (user && user.userId !== refs.current.selfId) {
          refreshUsers();
          return;
        }
        if (!refs.current.connected) return;
        setPhase(isInFailover ? 'reconnecting' : 'connected');
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
  }, [
    addListener,
    applySendTier,
    consultationId,
    notify,
    refreshUsers,
    resetLadders,
    sessionId,
    zoom,
  ]);

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
    if (phase === 'connected') socketRef.current?.emit('call:enter', { consultationId, sessionId });
  }, [consultationId, phase, sessionId]);

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
    let beat: ReturnType<typeof setInterval> | null = null;
    let stopped = false;
    (async () => {
      try {
        const token = await accessToken();
        if (stopped) return;
        socket = io(`${API_URL.replace(/\/api(\/v\d+)?$/, '')}/live`, {
          auth: { token },
          transports: ['websocket', 'polling'],
        });
        const seat = { consultationId, sessionId };
        // tells the server this phone is in the call, so killing the app or losing signal frees the seat within seconds
        const enter = () => {
          if (refs.current.connected) socket?.emit('call:enter', seat);
        };
        socketRef.current = socket;
        socket.on('connect', enter);
        beat = setInterval(() => {
          if (refs.current.connected && socket?.connected) socket.emit('call:beat', seat);
        }, 10_000);
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
            if (event.type === 'handover-decided')
              latest.current.settle(event.requestId, event.decision ?? '');
          }
        );
        // the server frees a seat the moment its device disappears, so a waiting device can take it at once
        socket.on(
          'call-seat',
          (event: { type?: string; consultationId?: string; sessionId?: string }) => {
            if (event.type !== 'seat-released' || event.consultationId !== consultationId) return;
            if (event.sessionId === sessionId || !latest.current.waiting) return;
            latest.current.settle(latest.current.waiting, 'accepted');
          }
        );
      } catch {
        // polling covers it
      }
    })();
    return () => {
      stopped = true;
      if (beat) clearInterval(beat);
      socketRef.current = null;
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
  latest.current.settle = settle;
  latest.current.waiting = waitingRequest;

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

  // --- measuring the line ---------------------------------------------------------------------

  // every two seconds read loss, delay and jitter from zoom and move each direction up or down
  React.useEffect(() => {
    if (phase !== 'connected') return;
    let stopped = false;
    const sample = async () => {
      try {
        const [audio, video] = (await Promise.all([
          zoom.session.getAudioStatisticsInfo(),
          zoom.session.getVideoStatisticsInfo(),
        ])) as [Stats, Stats];
        if (stopped || !refs.current.connected) return;
        const state = refs.current;
        const now = Date.now();
        const sendVerdict = judge({
          lossPct: Math.max(
            num(audio, 'sendPacketLossAvg'),
            state.videoOn ? num(video, 'sendPacketLossAvg') : 0
          ),
          latencyMs: Math.max(num(audio, 'sendLatency'), num(video, 'sendLatency')),
          jitterMs: Math.max(num(audio, 'sendJitter'), num(video, 'sendJitter')),
          zoom: state.selfNet,
        });
        const recvVerdict = judge({
          lossPct: Math.max(num(audio, 'recvPacketLossAvg'), num(video, 'recvPacketLossAvg')),
          latencyMs: Math.max(num(audio, 'recvLatency'), num(video, 'recvLatency')),
          jitterMs: Math.max(num(audio, 'recvJitter'), num(video, 'recvJitter')),
          zoom: 'unknown',
        });
        setUplink(linkOf(sendVerdict));
        setDownlink(linkOf(recvVerdict));
        setSendingP(shortSide(video, 'send'));
        setReceivingP(shortSide(video, 'recv'));
        const send: Ladder = climb(state.send, sendVerdict, now);
        if (send.tier !== state.send.tier) void applySendTier(send.tier, state.send.tier);
        state.send = send;
        const recv: Ladder = climb(state.recv, recvVerdict, now);
        if (recv.tier !== state.recv.tier) applyRecvTier(recv.tier, state.recv.tier);
        state.recv = recv;
      } catch {
        // the next sample tries again
      }
    };
    const timer = setInterval(sample, SAMPLE_MS);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [applyRecvTier, applySendTier, phase, zoom]);

  // the camera rests while the app is in the background; the call audio keeps going
  React.useEffect(() => {
    const subscription = AppState.addEventListener('change', (next) => {
      const state = refs.current;
      if (!state.connected) return;
      if (next === 'background' && !state.backgrounded) {
        state.backgrounded = true;
        state.resumeVideo = state.videoOn;
        if (state.videoOn) void setVideo(false);
      } else if (next === 'active' && state.backgrounded) {
        state.backgrounded = false;
        if (state.resumeVideo && state.wantsVideo && state.send.tier !== 'audio')
          void setVideo(true);
        state.resumeVideo = false;
      }
    });
    return () => subscription.remove();
  }, [setVideo]);

  // --- the phone's own connection -------------------------------------------------------------

  React.useEffect(() => {
    if (!network.online && refs.current.connected) setPhase('reconnecting');
    else if (network.online && phase === 'reconnecting' && refs.current.connected)
      setPhase('connected');
  }, [network.online, phase]);

  // back online: try again straight away instead of waiting for the next timer
  useOnReconnect(() => {
    const state = refs.current;
    if (state.leftByUser || state.connected || state.joining) return;
    if (phase !== 'reconnecting' && phase !== 'failed') return;
    if (state.rejoinTimer) clearTimeout(state.rejoinTimer);
    state.rejoinTimer = null;
    if (phase === 'failed') state.droppedAt = Date.now();
    setPhase('reconnecting');
    void latest.current.join(true);
  });

  // Never leave the call running if the screen goes away.
  React.useEffect(
    () => () => {
      if (refs.current.rejoinTimer) clearTimeout(refs.current.rejoinTimer);
      if (refs.current.connected || refs.current.joining || refs.current.droppedAt) {
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
    sendTier,
    recvTier,
    receivingP,
    sendingP,
    remoteWeak,
    connectedAt,
    notices,
    handover,
    doctorName,
    online: network.online,
    slow: network.slow,
    join: () => join(),
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
