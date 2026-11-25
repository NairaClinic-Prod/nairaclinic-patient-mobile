import { ActionButton } from '@/components/shared/action-button';
import { PressableScale } from '@/components/shared/pressable-scale';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { DUMMY_HOME } from '@/features/home/dummy';
import { cn } from '@/lib/utils';
import { ChevronDown, Heart, Link2, LockKeyhole, Share2, Users } from 'lucide-react-native';
import * as React from 'react';
import { Share, View } from 'react-native';
import { REFERRAL_FAQ, REFERRAL_STEPS } from '../constants';
import { WALLET_COINS } from '../pages-data';

const PEOPLE_JOINED = 3;

function Faq({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = React.useState(false);
  return (
    <View className="border-border border-t first:border-t-0">
      <PressableScale
        scaleTo={0.99}
        role="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((current) => !current)}
        className="flex-row items-center justify-between gap-3 py-3.5">
        <Text className="flex-1 text-[14px] leading-5 font-semibold">{question}</Text>
        <Icon
          as={ChevronDown}
          className={cn('text-muted-foreground size-4', open && 'rotate-180')}
        />
      </PressableScale>
      {open ? (
        <Text className="text-muted-foreground pb-3.5 text-[13px] leading-5">{answer}</Text>
      ) : null}
    </View>
  );
}

export function ReferView() {
  const { code, shareUrl } = DUMMY_HOME.referral;

  return (
    <View className="gap-5">
      <View className="gap-2">
        <View className="flex-row items-center gap-1.5">
          <Icon as={Heart} className="text-primary size-4" />
          <Text className="text-primary text-[11px] font-semibold tracking-[1.6px] uppercase">
            Referral rewards
          </Text>
        </View>
        <Text className="text-2xl leading-8 font-extrabold tracking-tight">
          Good care is worth sharing.
        </Text>
      </View>

      <View className="bg-secondary gap-3 rounded-3xl p-4">
        <Text className="text-muted-foreground text-xs">Your referral code</Text>
        <Text selectable className="text-foreground text-2xl font-extrabold tracking-[4px]">
          {code}
        </Text>
        <View className="bg-card rounded-xl px-3 py-2.5">
          <Text className="text-muted-foreground text-xs" numberOfLines={1}>
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
        <View className="bg-card flex-1 gap-2 rounded-2xl p-3.5">
          <View className="bg-secondary size-9 items-center justify-center rounded-full">
            <Icon as={Users} className="text-primary size-4" />
          </View>
          <View>
            <Text className="text-2xl font-extrabold">{PEOPLE_JOINED}</Text>
            <Text className="text-muted-foreground text-xs">People joined</Text>
          </View>
        </View>
        <View className="bg-card flex-1 gap-2 rounded-2xl p-3.5">
          <View className="bg-warning-soft size-9 items-center justify-center rounded-full">
            <Icon as={Heart} className="text-warning size-4" />
          </View>
          <View>
            <Text className="text-2xl font-extrabold">{WALLET_COINS.toLocaleString('en-NG')}</Text>
            <Text className="text-muted-foreground text-xs">Coins in your wallet</Text>
          </View>
        </View>
      </View>

      <View className="bg-card gap-4 rounded-2xl p-4">
        <Text className="text-base font-extrabold">How it works</Text>
        {REFERRAL_STEPS.map((step, index) => (
          <View key={step.title} className="flex-row gap-3">
            <View className="bg-secondary size-8 items-center justify-center rounded-full">
              <Text className="text-primary text-[13px] font-extrabold">{index + 1}</Text>
            </View>
            <View className="min-w-0 flex-1 gap-0.5">
              <Text className="text-[14px] font-bold">{step.title}</Text>
              <Text className="text-muted-foreground text-xs leading-4.5">{step.text}</Text>
            </View>
          </View>
        ))}
      </View>

      <View className="bg-card rounded-2xl px-4 pt-4">
        <Text className="pb-1 text-base font-extrabold">Helpful answers</Text>
        {REFERRAL_FAQ.map((item) => (
          <Faq key={item.question} {...item} />
        ))}
      </View>

      <View className="bg-muted flex-row items-start gap-3 rounded-2xl p-4">
        <Icon as={LockKeyhole} className="text-muted-foreground mt-0.5 size-4" />
        <View className="flex-1 gap-0.5">
          <Text className="text-[13px] font-bold">Referral privacy</Text>
          <Text className="text-muted-foreground text-xs leading-4.5">
            Health details and private account information are never shown in referral activity.
          </Text>
        </View>
      </View>
    </View>
  );
}
