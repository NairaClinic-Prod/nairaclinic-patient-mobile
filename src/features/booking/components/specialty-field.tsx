import { useSpecialties, type SpecialtyOption } from '@/api/booking';
import { PressableScale } from '@/components/shared/pressable-scale';
import { Sheet } from '@/components/shared/sheet';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as Haptics from 'expo-haptics';
import { Check, ChevronDown } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, View } from 'react-native';

const GENERAL = /^(general[\s_-]*practi|medical[\s_-]*officer|gp$)/i;

export const specialistOptions = (all: SpecialtyOption[] | undefined) =>
  (all ?? []).filter((item) => !GENERAL.test(item.slug) && !GENERAL.test(item.name));

export function specialtyName(slug: string | null | undefined, all?: SpecialtyOption[]) {
  if (!slug) return '';
  const known = all?.find((item) => item.slug === slug);
  if (known) return known.name;
  const text = slug.replace(/[_-]+/g, ' ').trim();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

type SpecialtyFieldProps = { value: string | null; onChange: (slug: string) => void };

export function SpecialtyField({ value, onChange }: SpecialtyFieldProps) {
  const [open, setOpen] = React.useState(false);
  const { data, isPending, isError, refetch } = useSpecialties();
  const options = specialistOptions(data);
  const label = value ? specialtyName(value, data) : null;

  return (
    <View className="gap-1.5">
      <Text className="text-xs font-semibold text-muted-foreground">
        {'Which specialist do you need?'}
        <Text className="text-xs font-semibold text-destructive">{' *'}</Text>
      </Text>
      <PressableScale
        scaleTo={0.99}
        role="button"
        accessibilityLabel={`Specialist: ${label ?? 'not chosen'}`}
        onPress={() => {
          setOpen(true);
          if (isError) refetch();
        }}
        className="h-12 flex-row items-center justify-between rounded-2xl bg-muted px-4">
        <Text className={cn('text-[15px]', label ? 'font-medium' : 'text-muted-foreground')}>
          {label ?? (isPending ? 'Loading specialists…' : 'Choose a specialist')}
        </Text>
        <Icon as={ChevronDown} className="size-4 text-muted-foreground" />
      </PressableScale>
      <Sheet open={open} onClose={() => setOpen(false)} title="Choose a specialist">
        {options.length === 0 ? (
          <Text className="px-1 py-6 text-center text-[13px] text-muted-foreground">
            {isPending
              ? 'Loading specialists…'
              : "We couldn't load the specialists. Close this and try again."}
          </Text>
        ) : (
          <View className="overflow-hidden rounded-3xl bg-muted">
            {options.map((option, index) => {
              const selected = option.slug === value;
              return (
                <Pressable
                  key={option.slug}
                  role="button"
                  accessibilityState={{ selected }}
                  onPress={() => {
                    Haptics.selectionAsync();
                    onChange(option.slug);
                    setOpen(false);
                  }}
                  className={cn(
                    'h-12 flex-row items-center justify-between border-border/70 px-4 active:opacity-70',
                    index < options.length - 1 && 'border-b'
                  )}>
                  <Text
                    className={cn(
                      'text-[14px]',
                      selected ? 'font-bold text-primary' : 'font-medium'
                    )}>
                    {option.name}
                  </Text>
                  {selected ? <Icon as={Check} className="size-4 text-primary" /> : null}
                </Pressable>
              );
            })}
          </View>
        )}
      </Sheet>
    </View>
  );
}
