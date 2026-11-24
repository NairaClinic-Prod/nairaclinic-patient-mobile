import { TextClassContext } from '@/components/ui/text';
import { useColor } from '@/hooks/use-color';
import { cn } from '@/lib/utils';
import { Button as NativeButton, Host, RNHostView, Row, Spacer } from '@expo/ui';
import { FilledTonalIconButton } from '@expo/ui/jetpack-compose';
import { cva, type VariantProps } from 'class-variance-authority';
import { ActivityIndicator, Platform, Pressable, View } from 'react-native';

const buttonVariants = cva(
  cn(
    'group shrink-0 flex-row items-center justify-center gap-2 rounded-md shadow-none',
    Platform.select({
      web: "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive whitespace-nowrap transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    })
  ),
  {
    variants: {
      variant: {
        glass: '',
        default: cn(
          'bg-primary active:bg-primary/90 shadow-sm shadow-black/5',
          Platform.select({ web: 'hover:bg-primary/90' })
        ),
        destructive: cn(
          'bg-destructive active:bg-destructive/90 dark:bg-destructive/60 shadow-sm shadow-black/5',
          Platform.select({
            web: 'hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40',
          })
        ),
        outline: cn(
          'border-border bg-background active:bg-accent dark:bg-input/30 dark:border-input dark:active:bg-input/50 border shadow-sm shadow-black/5',
          Platform.select({
            web: 'hover:bg-accent dark:hover:bg-input/50',
          })
        ),
        secondary: cn(
          'bg-secondary active:bg-secondary/80 shadow-sm shadow-black/5',
          Platform.select({ web: 'hover:bg-secondary/80' })
        ),
        ghost: cn(
          'active:bg-accent dark:active:bg-accent/50',
          Platform.select({ web: 'hover:bg-accent dark:hover:bg-accent/50' })
        ),
        link: '',
      },
      size: {
        default: cn('h-10 px-4 py-2 sm:h-9', Platform.select({ web: 'has-[>svg]:px-3' })),
        sm: cn('h-9 gap-1.5 rounded-md px-3 sm:h-8', Platform.select({ web: 'has-[>svg]:px-2.5' })),
        lg: cn('h-11 rounded-md px-6 sm:h-10', Platform.select({ web: 'has-[>svg]:px-4' })),
        icon: 'h-10 w-10 sm:h-9 sm:w-9',
      },
    },
    defaultVariants: {
      variant: 'glass',
      size: 'default',
    },
  }
);

const buttonTextVariants = cva(
  cn(
    'text-foreground text-sm font-medium',
    Platform.select({ web: 'pointer-events-none transition-colors' })
  ),
  {
    variants: {
      variant: {
        glass: 'text-primary-foreground font-bold',
        default: 'text-primary-foreground',
        destructive: 'text-white',
        outline: cn(
          'group-active:text-accent-foreground',
          Platform.select({ web: 'group-hover:text-accent-foreground' })
        ),
        secondary: 'text-secondary-foreground',
        ghost: 'group-active:text-accent-foreground',
        link: cn(
          'text-primary group-active:underline',
          Platform.select({ web: 'underline-offset-4 group-hover:underline hover:underline' })
        ),
      },
      size: {
        default: '',
        sm: '',
        lg: '',
        icon: '',
      },
    },
    defaultVariants: {
      variant: 'glass',
      size: 'default',
    },
  }
);

type ButtonProps = Omit<React.ComponentProps<typeof Pressable>, 'children'> & {
  children?: React.ReactNode;
  loading?: boolean;
} & VariantProps<typeof buttonVariants>;

const GLASS_HEIGHT = { default: 48, sm: 40, lg: 56, icon: 48 };
const HAS_IOS_GLASS = Platform.OS === 'ios' && parseInt(String(Platform.Version), 10) >= 26;

// The glass variant is the system button: Liquid Glass on iOS 26+, Material 3 on Android.
function GlassButton({ size, onPress, disabled, children, accessibilityLabel }: ButtonProps) {
  const color = useColor();
  const icon = size === 'icon';
  const height = GLASS_HEIGHT[size ?? 'default'];
  const press = onPress && !disabled ? () => onPress({} as never) : undefined;
  const content = (
    <RNHostView matchContents>
      <View>{children}</View>
    </RNHostView>
  );

  if (Platform.OS === 'android' && icon) {
    return (
      <Host style={{ width: height, height }} seedColor={color.primary}>
        <FilledTonalIconButton onClick={press} enabled={!disabled}>
          {content}
        </FilledTonalIconButton>
      </Host>
    );
  }

  const ios =
    Platform.OS === 'ios'
      ? (require('@expo/ui/swift-ui/modifiers') as typeof import('@expo/ui/swift-ui/modifiers'))
      : null;
  const modifiers = ios
    ? [
        ios.buttonStyle(
          icon
            ? HAS_IOS_GLASS
              ? 'glass'
              : 'bordered'
            : HAS_IOS_GLASS
              ? 'glassProminent'
              : 'borderedProminent'
        ),
        ios.buttonBorderShape(icon ? 'circle' : 'capsule'),
        ios.controlSize('large'),
      ]
    : [];

  return (
    <Host
      style={icon ? { width: height, height } : { height, alignSelf: 'stretch' }}
      seedColor={color.primary}
      accessibilityLabel={accessibilityLabel ?? undefined}>
      <NativeButton
        onPress={press}
        disabled={!!disabled}
        modifiers={modifiers}
        style={icon ? undefined : { height }}>
        {icon ? (
          content
        ) : (
          <Row style={{ width: '100%' }} alignment="center">
            <Spacer />
            {content}
            <Spacer />
          </Row>
        )}
      </NativeButton>
    </Host>
  );
}

// With `loading` the label is replaced by a spinner and the button ignores presses.
function Button({
  className,
  variant = 'glass',
  size,
  loading,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const color = useColor();
  const filled = variant === 'glass' || variant === 'default' || variant === 'destructive';
  const content = loading ? (
    <ActivityIndicator color={filled ? color.primaryForeground : color.primary} />
  ) : (
    children
  );
  const inactive = disabled || loading;

  if (variant === 'glass' && Platform.OS !== 'web') {
    return (
      <TextClassContext.Provider value={buttonTextVariants({ variant, size })}>
        <GlassButton size={size} disabled={inactive} {...props}>
          {content}
        </GlassButton>
      </TextClassContext.Provider>
    );
  }
  return (
    <TextClassContext.Provider value={buttonTextVariants({ variant, size })}>
      <Pressable
        className={cn(inactive && 'opacity-50', buttonVariants({ variant, size }), className)}
        role="button"
        disabled={inactive}
        {...props}>
        {content}
      </Pressable>
    </TextClassContext.Provider>
  );
}

export { Button, buttonTextVariants, buttonVariants };
export type { ButtonProps };
