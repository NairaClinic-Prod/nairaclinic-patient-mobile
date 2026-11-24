import { ActionButton } from '@/components/shared/action-button';
import { Sheet } from '@/components/shared/sheet';
import { TextField } from '@/components/shared/text-field';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { Bell, ChevronRight, FlaskConical, Pill, type LucideIcon } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, View } from 'react-native';
import { addTodo } from '../store';
import type { ClinicRecordKind } from './add-from-clinic';

type Kind = ClinicRecordKind | 'personal';

const CHOICES: { kind: Kind; title: string; description: string; icon: LucideIcon }[] = [
  {
    kind: 'test',
    title: 'Test request from another clinic',
    description: 'Add lab tests or procedures requested outside NairaClinic.',
    icon: FlaskConical,
  },
  {
    kind: 'medication',
    title: 'Prescription from another clinic',
    description: 'Add medicines prescribed outside NairaClinic.',
    icon: Pill,
  },
  {
    kind: 'personal',
    title: 'Write my own',
    description: 'Drink water, eat fruit, or any personal care task.',
    icon: Bell,
  },
];

type AddTodoSheetProps = {
  open: boolean;
  onClose: () => void;
  onPickExternal?: (kind: ClinicRecordKind) => void;
};

export function AddTodoSheet({ open, onClose, onPickExternal }: AddTodoSheetProps) {
  const [writing, setWriting] = React.useState(false);
  const [title, setTitle] = React.useState('');
  const [note, setNote] = React.useState('');

  React.useEffect(() => {
    if (open) {
      setWriting(false);
      setTitle('');
      setNote('');
    }
  }, [open]);

  function pick(kind: Kind) {
    if (kind === 'personal') return setWriting(true);
    onClose();
    onPickExternal?.(kind);
  }

  function save() {
    addTodo(title.trim(), note.trim());
    onClose();
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={writing ? 'Write my own' : 'Add a reminder or to-do'}
      subtitle={
        writing
          ? 'A personal care task for your to-do list.'
          : 'Add a test request or prescription from another clinic, or write a personal care task.'
      }
      snapPoints={writing ? ['62%'] : ['58%']}
      footer={
        writing ? (
          <View className="flex-row gap-2">
            <ActionButton
              size="md"
              label="Back"
              variant="outline"
              className="flex-1"
              onPress={() => setWriting(false)}
            />
            <ActionButton
              size="md"
              label="Add to my to-do"
              className="flex-[2]"
              disabled={!title.trim()}
              onPress={save}
            />
          </View>
        ) : undefined
      }>
      {writing ? (
        <View className="gap-3.5">
          <TextField
            sheet
            tone="muted"
            label="Title"
            required
            maxLength={120}
            placeholder="e.g. Drink water"
            value={title}
            onChangeText={setTitle}
          />
          <TextField
            sheet
            tone="muted"
            label="Note · optional"
            multiline
            maxLength={300}
            value={note}
            onChangeText={setNote}
          />
        </View>
      ) : (
        <View className="gap-2.5">
          {CHOICES.map((choice) => {
            const personal = choice.kind === 'personal';
            return (
              <Pressable
                key={choice.kind}
                role="button"
                onPress={() => pick(choice.kind)}
                className={cn(
                  'flex-row items-center gap-3 rounded-3xl p-3.5 active:opacity-70',
                  personal ? 'bg-primary' : 'bg-muted'
                )}>
                <Icon
                  as={choice.icon}
                  className={cn('size-5', personal ? 'text-primary-foreground' : 'text-primary')}
                />
                <View className="flex-1 gap-0.5">
                  <Text
                    className={cn(
                      'text-[13px] font-bold',
                      personal ? 'text-primary-foreground' : undefined
                    )}>
                    {choice.title}
                  </Text>
                  <Text
                    className={cn(
                      'text-[11px] leading-4',
                      personal ? 'text-primary-foreground/80' : 'text-muted-foreground'
                    )}>
                    {choice.description}
                  </Text>
                </View>
                <Icon
                  as={ChevronRight}
                  className={cn(
                    'size-4',
                    personal ? 'text-primary-foreground' : 'text-muted-foreground'
                  )}
                />
              </Pressable>
            );
          })}
        </View>
      )}
    </Sheet>
  );
}
