import { PressableScale } from '@/components/shared/pressable-scale';
import { Sheet } from '@/components/shared/sheet';
import { TextField } from '@/components/shared/text-field';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { Check, ChevronDown, ImagePlus, X } from 'lucide-react-native';
import * as React from 'react';
import { Image, Pressable, View } from 'react-native';
import { MAX_PHOTOS, REASON_OPTIONS } from '../constants';
import type { BookingIdentity } from '../identity';

type DetailsCardProps = {
  identity: BookingIdentity;
  reason: string;
  onReason: (value: string) => void;
  symptoms: string;
  onSymptoms: (value: string) => void;
  photos: string[];
  onPhotos: (value: string[]) => void;
};

function ReasonField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = React.useState(false);
  const current = REASON_OPTIONS.find((option) => option.value === value);

  return (
    <View className="gap-1.5">
      <Text className="text-xs font-semibold text-muted-foreground">
        {'Reason for visit'}
        <Text className="text-xs font-semibold text-destructive">{' *'}</Text>
      </Text>
      <PressableScale
        scaleTo={0.99}
        role="button"
        accessibilityLabel={`Reason for visit: ${current?.label ?? 'not chosen'}`}
        onPress={() => setOpen(true)}
        className="h-12 flex-row items-center justify-between rounded-2xl bg-muted px-4">
        <Text className={cn('text-[15px]', current ? 'font-medium' : 'text-muted-foreground')}>
          {current?.label ?? 'Choose a reason'}
        </Text>
        <Icon as={ChevronDown} className="size-4 text-muted-foreground" />
      </PressableScale>
      <Sheet open={open} onClose={() => setOpen(false)} title="Reason for visit">
        <View className="overflow-hidden rounded-3xl bg-muted">
          {REASON_OPTIONS.map((option, index) => {
            const selected = option.value === value;
            return (
              <Pressable
                key={option.value}
                role="button"
                accessibilityState={{ selected }}
                onPress={() => {
                  Haptics.selectionAsync();
                  onChange(option.value);
                  setOpen(false);
                }}
                className={cn(
                  'h-12 flex-row items-center justify-between border-border/70 px-4 active:opacity-70',
                  index < REASON_OPTIONS.length - 1 && 'border-b'
                )}>
                <Text
                  className={cn(
                    'text-[14px]',
                    selected ? 'font-bold text-primary' : 'font-medium'
                  )}>
                  {option.label}
                </Text>
                {selected ? <Icon as={Check} className="size-4 text-primary" /> : null}
              </Pressable>
            );
          })}
        </View>
      </Sheet>
    </View>
  );
}

function PhotoPicker({
  photos,
  onChange,
}: {
  photos: string[];
  onChange: (value: string[]) => void;
}) {
  async function add() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: MAX_PHOTOS - photos.length,
      quality: 0.7,
    });
    if (!result.canceled) {
      onChange([...photos, ...result.assets.map((asset) => asset.uri)].slice(0, MAX_PHOTOS));
    }
  }

  return (
    <View className="gap-2">
      <Text className="text-xs font-semibold text-muted-foreground">
        {'Photos '}
        <Text className="text-xs font-normal text-muted-foreground">(optional)</Text>
      </Text>
      <Text className="text-xs leading-4.5 text-muted-foreground">
        Add clear photos of anything visible, like a rash or swelling.
      </Text>
      <View className="flex-row flex-wrap gap-2.5">
        {photos.map((uri) => (
          <View key={uri} className="size-20 overflow-hidden rounded-xl bg-muted">
            <Image source={{ uri }} className="size-full" />
            <Pressable
              role="button"
              accessibilityLabel="Remove photo"
              hitSlop={6}
              onPress={() => onChange(photos.filter((item) => item !== uri))}
              className="absolute top-1 right-1 size-5 items-center justify-center rounded-full bg-black/60">
              <Icon as={X} className="size-3 text-white" />
            </Pressable>
          </View>
        ))}
        {photos.length < MAX_PHOTOS ? (
          <PressableScale
            scaleTo={0.95}
            role="button"
            accessibilityLabel="Add photos"
            onPress={add}
            className="size-20 items-center justify-center gap-1 rounded-xl border border-dashed border-primary/50 bg-secondary/40">
            <Icon as={ImagePlus} className="size-5 text-primary" />
            <Text className="text-[11px] font-semibold text-primary">Add</Text>
          </PressableScale>
        ) : null}
      </View>
    </View>
  );
}

export function DetailsCard({
  identity,
  reason,
  onReason,
  symptoms,
  onSymptoms,
  photos,
  onPhotos,
}: DetailsCardProps) {
  return (
    <View className="gap-4 rounded-2xl bg-card p-4">
      <View className="gap-1">
        <Text className="text-[15px] font-bold">Your details</Text>
        <Text className="text-xs text-muted-foreground">
          {identity.name ? `Booking for ${identity.name}` : 'Tell us about this visit.'}
        </Text>
      </View>
      <ReasonField value={reason} onChange={onReason} />
      <TextField
        label="Symptoms (optional)"
        multiline
        tone="muted"
        placeholder="Describe your symptoms…"
        value={symptoms}
        onChangeText={onSymptoms}
        maxLength={1000}
      />
      <PhotoPicker photos={photos} onChange={onPhotos} />
    </View>
  );
}
