import type { ChatMessage } from '@/api/call';
import { callApi } from '@/api/call';
import { accessToken } from '@/lib/auth/session';
import { API_URL } from '@/lib/env';
import * as React from 'react';
import { io } from 'socket.io-client';

export type ChatState = {
  messages: ChatMessage[];
  unread: number;
  connected: boolean;
  doctorTyping: boolean;
  send: (text: string) => void;
  retry: (message: ChatMessage) => void;
  typing: (isTyping: boolean) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
};

const clean = (list: ChatMessage[]) => list.filter((item) => item && (item.text || item.fileUrl));

// The chat that runs beside the call: history, live messages from the doctor, and sending. Messages are
// kept as they arrive, so the doctor's note is still there after the sheet is closed and reopened.
export function useCallChat(consultationId: string, enabled: boolean): ChatState {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [unread, setUnread] = React.useState(0);
  const [connected, setConnected] = React.useState(false);
  const [doctorTyping, setDoctorTyping] = React.useState(false);
  const [open, setOpenState] = React.useState(false);
  const openRef = React.useRef(false);
  const socketRef = React.useRef<ReturnType<typeof io> | null>(null);
  const typingTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const setOpen = React.useCallback(
    (next: boolean) => {
      openRef.current = next;
      setOpenState(next);
      if (next) {
        setUnread(0);
        socketRef.current?.emit('mark-read', { consultationId });
      }
    },
    [consultationId]
  );

  React.useEffect(() => {
    if (!enabled) return;
    let stopped = false;

    callApi
      .chatMessages(consultationId)
      .then((history) => {
        if (stopped || !Array.isArray(history)) return;
        // anything that arrived live while this loaded stays
        setMessages((current) => {
          const known = new Set(history.map((item) => item.id));
          return [...clean(history), ...current.filter((item) => !known.has(item.id))];
        });
      })
      .catch(() => undefined);

    (async () => {
      try {
        const token = await accessToken();
        if (stopped) return;
        const socket = io(`${API_URL.replace(/\/api(\/v\d+)?$/, '')}/consultation-chat`, {
          auth: { token, consultationId },
          transports: ['websocket', 'polling'],
        });
        socketRef.current = socket;
        socket.on('connect', () => {
          setConnected(true);
          socket.emit('join-consultation-chat', { consultationId });
          if (openRef.current) socket.emit('mark-read', { consultationId });
        });
        socket.on('disconnect', () => setConnected(false));
        socket.on('connect_error', (error) => console.warn('[call-chat] socket could not connect:', error.message));
        socket.on('new-message', (message: ChatMessage) => {
          if (!message || (!message.text && !message.fileUrl)) return;
          setMessages((current) => {
            if (current.some((item) => item.id === message.id)) return current;
            // our own message replaces the placeholder shown while it was sending
            const placeholder = current.findIndex(
              (item) =>
                item.id.startsWith('temp_') &&
                item.senderRole === message.senderRole &&
                item.text === message.text
            );
            if (placeholder === -1) return [...current, message];
            const next = [...current];
            next[placeholder] = message;
            return next;
          });
          if (message.senderRole === 'patient') return;
          if (openRef.current) socket.emit('mark-read', { consultationId });
          else setUnread((count) => count + 1);
        });
        socket.on('user-typing', (event: { userType?: string; isTyping?: boolean }) => {
          if (event.userType === 'patient') return;
          setDoctorTyping(Boolean(event.isTyping));
          if (typingTimer.current) clearTimeout(typingTimer.current);
          if (event.isTyping) typingTimer.current = setTimeout(() => setDoctorTyping(false), 4000);
        });
      } catch {
        // the history above still loads; live messages need the connection
      }
    })();

    return () => {
      stopped = true;
      if (typingTimer.current) clearTimeout(typingTimer.current);
      socketRef.current?.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [consultationId, enabled]);

  const settleSent = React.useCallback((placeholder: string, saved: ChatMessage | null) => {
    setMessages((current) => {
      if (!saved) return current.map((m) => (m.id === placeholder ? { ...m, failed: true } : m));
      // the live copy may have arrived first
      if (current.some((m) => m.id === saved.id)) return current.filter((m) => m.id !== placeholder);
      return current.map((m) => (m.id === placeholder ? saved : m));
    });
  }, []);

  // Over the live connection when it is up, otherwise (or if that fails) over plain HTTP.
  const deliver = React.useCallback(
    async (placeholder: string, body: string) => {
      const socket = socketRef.current;
      if (socket?.connected) {
        const saved = await new Promise<ChatMessage | null>((resolve) =>
          socket
            .timeout(8000)
            .emit(
              'send-message',
              { consultationId, text: body },
              (error: Error | null, reply?: { success?: boolean; data?: ChatMessage }) =>
                resolve(!error && reply?.success && reply.data ? reply.data : null)
            )
        );
        if (saved) return settleSent(placeholder, saved);
      }
      const saved = await callApi.sendChat(consultationId, body).catch(() => null);
      settleSent(placeholder, saved);
    },
    [consultationId, settleSent]
  );

  const send = React.useCallback(
    (text: string) => {
      const body = text.trim();
      if (!body) return;
      const id = `temp_${Date.now()}`;
      setMessages((current) => [
        ...current,
        {
          id,
          senderRole: 'patient',
          senderName: 'You',
          text: body,
          createdAt: new Date().toISOString(),
        },
      ]);
      void deliver(id, body);
    },
    [deliver]
  );

  const retry = React.useCallback(
    (message: ChatMessage) => {
      if (!message.text) return;
      setMessages((current) => current.map((m) => (m.id === message.id ? { ...m, failed: false } : m)));
      void deliver(message.id, message.text);
    },
    [deliver]
  );

  const typing = React.useCallback(
    (isTyping: boolean) => socketRef.current?.emit('typing', { consultationId, isTyping }),
    [consultationId]
  );

  return { messages, unread, connected, doctorTyping, send, retry, typing, open, setOpen };
}
