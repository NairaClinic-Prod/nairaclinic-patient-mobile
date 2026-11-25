import { ActionButton } from '@/components/shared/action-button';
import { PressableScale } from '@/components/shared/pressable-scale';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useWallet } from '@/features/wallet/store';
import { cn } from '@/lib/utils';
import { ChevronDown, Heart, Link2, LockKeyhole, Share2, Users } from 'lucide-react-native';
import * as React from 'react';
import { Share, View } from 'react-native';
import { REFERRAL_FAQ, REFERRAL_STEPS } from '../constants';
import { DUMMY_REFERRAL } from '../dummy';

function Faq({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = React.useState(false);
  return (
    <View className="border-t border-border first:border-t-0">
      <PressableScale
        scaleTo={0.99}
        role="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((current) => !current)}
        className="flex-row items-center justify-between gap-3 py-3.5">
        <Text className="flex-1 text-[14px] leading-5 font-semibold">{question}</Text>
        <Icon
          as={ChevronDown}
          className={cn('size-4 text-muted-foreground', open && 'rotate-180')}
        />
      </PressableScale>
      {open ? (
        <Text className="pb-3.5 text-[13px] leading-5 text-muted-foreground">{answer}</Text>
      ) : null}
    </View>
  );
}

export function ReferView() {
  const { code, shareUrl, joined } = DUMMY_REFERRAL;
  const { coins } = useWallet();

  return (
    <View className="gap-5">
      <View className="gap-2">
        <View className="flex-row items-center gap-1.5">
          <Icon as={Heart} className="size-4 text-primary" />
          <Text className="text-[11px] font-semibold tracking-[1.6px] text-primary uppercase">
            Referral rewards
          </Text>
        </View>
        <Text className="text-2xl leading-8 font-extrabold tracking-tight">
          Good care is worth sharing.
        </Text>
      </View>

      <View className="gap-3 rounded-3xl bg-secondary p-4">
        <Text className="text-xs text-muted-foreground">Your referral code</Text>
        <Text selectable className="text-2xl font-extrabold tracking-[4px] text-foreground">
          {code}
        </Text>
        <View className="rounded-xl bg-card px-3 py-2.5">
          <Text className="text-xs text-muted-foreground" numberOfLines={1}>
            {shareUrl}
          </Text>
        </View>
        <View className="flex-row gap-2">
          <ActionButton
            size="md"
            icon={Share2}
            label="Share invite"
            className="flex-1"
            onPress={() =>
              Share.share({
                message: `Join me on NairaClinic. Use my referral code ${code}`,
                url: shareUrl,
              })
            }
          />
          <ActionButton
            size="md"
            variant="outline"
            icon={Link2}
            label="Share link"
            className="flex-1"
            onPress={() => Share.share({ message: shareUrl })}
          />
        </View>
      </View>

      <View className="flex-row gap-2.5">
        <View className="flex-1 gap-2 rounded-2xl bg-card p-3.5">
          <View className="size-9 items-center justify-center rounded-full bg-secondary">
            <Icon as={Users} className="size-4 text-primary" />
          </View>
          <View>
            <Text className="text-2xl font-extrabold">{joined}</Text>
            <Text className="text-xs text-muted-foreground">People joined</Text>
          </View>
        </View>
        <View className="flex-1 gap-2 rounded-2xl bg-card p-3.5">
          <View className="size-9 items-center justify-center rounded-full bg-warning-soft">
            <Icon as={Heart} className="size-4 text-warning" />
          </View>
          <View>
            <Text className="text-2xl font-extrabold">{coins.toLocaleString('en-NG')}</Text>
            <Text className="text-xs text-muted-foreground">Coins in your wallet</Text>
          </View>
        </View>
      </View>

      <View className="gap-4 rounded-2xl bg-card p-4">
        <Text className="text-base font-extrabold">How it works</Text>
        {REFERRAL_STEPS.map((step, index) => (
          <View key={step.title} className="flex-row gap-3">
            <View className="size-8 items-center justify-center rounded-full bg-secondary">
              <Text className="text-[13px] font-extrabold text-primary">{index + 1}</Text>
            </View>
            <View className="min-w-0 flex-1 gap-0.5">
              <Text className="text-[14px] font-bold">{step.title}</Text>
              <Text className="text-xs leading-4.5 text-muted-foreground">{step.text}</Text>
            </View>
          </View>
        ))}
      </View>

      <View className="rounded-2xl bg-card px-4 pt-4">
        <Text className="pb-1 text-base font-extrabold">Helpful answers</Text>
        {REFERRAL_FAQ.map((item) => (
          <Faq key={item.question} {...item} />
        ))}
      </View>

      <View className="flex-row items-start gap-3 rounded-2xl bg-muted p-4">
        <Icon as={LockKeyhole} className="mt-0.5 size-4 text-muted-foreground" />
        <View className="flex-1 gap-0.5">
          <Text className="text-[13px] font-bold">Referral privacy</Text>
          <Text className="text-xs leading-4.5 text-muted-foreground">
            Health details and private account information are never shown in referral activity.
          </Text>
        </View>
      </View>
    </View>
  );
}
