import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { Send, X } from 'lucide-react-native';
import * as React from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ChatMessage } from '@/api/call';
import type { ChatState } from '../chat';

const clock = (iso: string) => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};

function Bubble({ message, onRetry }: { message: ChatMessage; onRetry: () => void }) {
  const mine = message.senderRole === 'patient';
  return (
    <View className={cn('max-w-[82%] gap-1', mine ? 'items-end self-end' : 'items-start self-start')}>
      <View className={cn('rounded-2xl px-3.5 py-2.5', mine ? 'bg-white' : 'bg-white/15')}>
        <Text className={cn('text-[15px] leading-5', mine ? 'text-black' : 'text-white')}>
          {message.text || message.fileName || 'Attachment'}
        </Text>
      </View>
      {message.failed ? (
        <Pressable onPress={onRetry} hitSlop={8}>
          <Text className="px-1 text-[11px] text-red-400">Not sent. Tap to try again</Text>
        </Pressable>
      ) : (
        <Text className="px-1 text-[11px] text-white/45">
          {message.id.startsWith('temp_') ? 'Sending…' : clock(message.createdAt)}
        </Text>
      )}
    </View>
  );
}

// The in-call chat: slides over the video so the doctor's messages can be read without leaving the call.
export function ChatSheet({ chat, doctorName }: { chat: ChatState; doctorName: string }) {
  const insets = useSafeAreaInsets();
  const [text, setText] = React.useState('');
  const list = React.useRef<FlatList<ChatMessage>>(null);

  React.useEffect(() => {
    if (chat.open) setTimeout(() => list.current?.scrollToEnd({ animated: false }), 50);
  }, [chat.open]);

  if (!chat.open) return null;

  function submit() {
    if (!text.trim()) return;
    chat.send(text);
    chat.typing(false);
    setText('');
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="absolute inset-0 justify-end">
      <Pressable className="flex-1" onPress={() => chat.setOpen(false)} />
      <View
        className="h-[65%] rounded-t-3xl bg-neutral-900"
        style={{ paddingBottom: Math.max(insets.bottom, 12) }}>
        <View className="flex-row items-center justify-between px-5 pt-4 pb-2">
          <View>
            <Text className="text-[17px] font-semibold text-white">Chat</Text>
            <Text className="text-[12px] text-white/50">
              {chat.doctorTyping ? `${doctorName} is typing…` : chat.connected ? doctorName : 'Connecting…'}
            </Text>
          </View>
          <Pressable
            accessibilityLabel="Close chat"
            hitSlop={12}
            onPress={() => chat.setOpen(false)}
            className="size-9 items-center justify-center rounded-full bg-white/10">
            <Icon as={X} className="size-5 text-white" />
          </Pressable>
        </View>
        <FlatList
          ref={list}
          data={chat.messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <Bubble message={item} onRetry={() => chat.retry(item)} />}
          contentContainerClassName="gap-3 px-4 py-3"
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => list.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <Text className="pt-10 text-center text-[14px] text-white/45">
              No messages yet. Anything you or the doctor send shows up here.
            </Text>
          }
        />
        <View className="flex-row items-end gap-2 px-4 pt-2">
          <TextInput
            value={text}
            onChangeText={(value) => {
              setText(value);
              chat.typing(value.length > 0);
            }}
            onBlur={() => chat.typing(false)}
            placeholder="Type a message"
            placeholderTextColor="rgba(255,255,255,0.4)"
            multiline
            maxLength={2000}
            className="max-h-28 min-h-11 flex-1 rounded-2xl bg-white/10 px-4 py-2.5 text-[15px] text-white"
          />
          <Pressable
            accessibilityLabel="Send message"
            onPress={submit}
            disabled={!text.trim()}
            className={cn(
              'size-11 items-center justify-center rounded-full',
              text.trim() ? 'bg-white' : 'bg-white/25'
            )}>
            <Icon as={Send} className="size-5 text-black" />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
