import { useButtonFill } from '@/components/patterns/button-row';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react-native';
import { Pressable } from 'react-native';

type Variant = 'primary' | 'outline' | 'ghost' | 'danger';

const BOX: Record<Variant, string> = {
  primary: 'bg-primary',
  outline: 'border-border bg-card border',
  ghost: 'bg-transparent',
  danger: 'bg-destructive/10',
};

const TEXT: Record<Variant, string> = {
  primary: 'text-primary-foreground',
  outline: 'text-foreground',
  ghost: 'text-primary',
  danger: 'text-destructive',
};

type ActionButtonProps = {
  label?: string;
  icon?: LucideIcon;
  variant?: Variant;
  size?: 'sm' | 'md';
  disabled?: boolean;
  accessibilityLabel?: string;
  className?: string;
  textClassName?: string;
  onPress?: () => void;
};

export function ActionButton({
  label,
  icon,
  variant = 'primary',
  size = 'sm',
  disabled,
  accessibilityLabel,
  className,
  textClassName,
  onPress,
}: ActionButtonProps) {
  const small = size === 'sm';
  const fill = useButtonFill() && Boolean(label);
  return (
    <Pressable
      role="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      onPress={onPress}
      style={fill ? { flexGrow: 1, flexBasis: '45%' } : undefined}
      className={cn(
        'flex-row items-center justify-center gap-1.5 rounded-full active:opacity-70',
        label
          ? small
            ? 'min-h-9 px-3.5 py-2'
            : 'min-h-11 px-5 py-2.5'
          : small
            ? 'h-9 w-9'
            : 'h-11 w-11',
        BOX[variant],
        disabled && 'opacity-45',
        className
      )}>
      {icon ? <Icon as={icon} className={cn(small ? 'size-3.5' : 'size-4', TEXT[variant])} /> : null}
      {label ? (
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
          className={cn(
            'shrink text-center font-bold',
            small ? 'text-xs' : 'text-[13px]',
            TEXT[variant],
            textClassName
          )}>
          {label}
        </Text>
      ) : null}
    </Pressable>
  );
}
