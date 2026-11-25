import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Reveal } from '@/features/onboarding/components/reveal';
import { useColor } from '@/hooks/use-color';
import type { LucideIcon } from 'lucide-react-native';
import {
  Activity,
  BadgeCheck,
  Bike,
  FlaskConical,
  HeartPulse,
  PackageCheck,
  Pill,
  Sparkles,
  Stethoscope,
  Store,
  Video,
} from 'lucide-react-native';
import * as React from 'react';
import { Image, View, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const LOGO = require('@assets/images/logo.png');

export const CANVAS = 320;
const CENTER = CANVAS / 2;

const SHADOW: ViewStyle = {
  shadowColor: '#0a251e',
  shadowOpacity: 0.1,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 6 },
};

function Bubble({
  icon,
  size,
  filled,
  iconClassName = 'size-6',
}: {
  icon: LucideIcon;
  size: number;
  filled?: boolean;
  iconClassName?: string;
}) {
  const color = useColor();
  return (
    <View
      style={[
        SHADOW,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: filled ? color.primary : color.card,
          borderWidth: filled ? 0 : 1,
          borderColor: color.border,
        },
      ]}>
      <Icon
        as={icon}
        className={`${iconClassName} ${filled ? 'text-primary-foreground' : 'text-primary'}`}
      />
    </View>
  );
}

function Card({ style, children }: { style?: ViewStyle; children: React.ReactNode }) {
  const color = useColor();
  return (
    <View
      style={[
        SHADOW,
        { backgroundColor: color.card, borderWidth: 1, borderColor: color.border },
        style,
      ]}>
      {children}
    </View>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  const color = useColor();
  return (
    <View
      style={[
        SHADOW,
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          paddingHorizontal: 12,
          height: 36,
          borderRadius: 18,
          backgroundColor: color.card,
          borderWidth: 1,
          borderColor: color.border,
        },
      ]}>
      {children}
    </View>
  );
}

function polar(angle: number, radius: number, size: number) {
  const rad = (angle * Math.PI) / 180;
  return {
    position: 'absolute' as const,
    left: CENTER + radius * Math.cos(rad) - size / 2,
    top: CENTER + radius * Math.sin(rad) - size / 2,
  };
}

const SATELLITES = [
  { icon: Pill, angle: -90, distance: 70 },
  { icon: Stethoscope, angle: -18, distance: 100 },
  { icon: Video, angle: 54, distance: 80 },
  { icon: Sparkles, angle: 126, distance: 110, filled: true },
  { icon: FlaskConical, angle: 198, distance: 90 },
];

function EverythingIllustration() {
  const color = useColor();
  return (
    <>
      <Reveal
        distance={20}
        style={{ position: 'absolute', left: 10, top: 10, width: 300, height: 300 }}>
        <View
          style={{
            flex: 1,
            borderRadius: 150,
            backgroundColor: `${color.primary}12`,
          }}
        />
      </Reveal>
      <Reveal
        distance={30}
        style={{ position: 'absolute', left: 48, top: 48, width: 224, height: 224 }}>
        <View
          style={{
            flex: 1,
            borderRadius: 112,
            backgroundColor: `${color.primary}14`,
            borderWidth: 1,
            borderColor: `${color.primary}26`,
          }}
        />
      </Reveal>
      <Reveal distance={24} style={{ position: 'absolute', left: CENTER - 52, top: CENTER - 52 }}>
        <View
          style={[
            SHADOW,
            {
              width: 104,
              height: 104,
              borderRadius: 52,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: color.card,
            },
          ]}>
          <Image source={LOGO} style={{ width: 64, height: 64 }} resizeMode="contain" />
        </View>
      </Reveal>
      {SATELLITES.map((item) => (
        <Reveal
          key={item.angle}

          distance={item.distance}
          style={polar(item.angle, 112, 56)}>
          <Bubble icon={item.icon} size={56} filled={item.filled} />
        </Reveal>
      ))}
    </>
  );
}

function DoctorIllustration() {
  const color = useColor();
  return (
    <>
      <Reveal
        distance={30}
        style={{ position: 'absolute', left: 30, top: 22, width: 170, height: 170 }}>
        <View
          style={{
            flex: 1,
            borderRadius: 40,
            backgroundColor: `${color.primary}14`,
            transform: [{ rotate: '-10deg' }],
          }}
        />
      </Reveal>
      <Reveal
        distance={50}
        style={{ position: 'absolute', left: 120, top: 120, width: 170, height: 170 }}>
        <View
          style={{
            flex: 1,
            borderRadius: 40,
            backgroundColor: `${color.accentForeground}14`,
            transform: [{ rotate: '8deg' }],
          }}
        />
      </Reveal>
      <Reveal
        distance={64}
        style={{ position: 'absolute', left: 62, top: 28, width: 196, height: 250 }}>
        <Card
          style={{
            flex: 1,
            borderRadius: 36,
            alignItems: 'center',
            paddingTop: 34,
            backgroundColor: color.secondary,
          }}>
          <View
            style={{
              width: 112,
              height: 112,
              borderRadius: 56,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: color.card,
            }}>
            <Icon as={Stethoscope} className="size-14 text-primary" />
          </View>
          <View
            style={{
              width: 96,
              height: 10,
              borderRadius: 5,
              marginTop: 26,
              backgroundColor: `${color.primary}33`,
            }}
          />
          <View
            style={{
              width: 64,
              height: 8,
              borderRadius: 4,
              marginTop: 10,
              backgroundColor: `${color.primary}1f`,
            }}
          />
        </Card>
      </Reveal>
      <Reveal distance={90} style={{ position: 'absolute', left: 4, top: 238 }}>
        <Chip>
          <Icon as={BadgeCheck} className="size-4 text-primary" />
          <Text className="text-[13px] font-semibold">Verified doctors</Text>
        </Chip>
      </Reveal>
      <Reveal distance={80} style={{ position: 'absolute', left: 178, top: 40 }}>
        <Chip>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color.success }} />
          <Text className="text-[13px] font-semibold">Available now</Text>
        </Chip>
      </Reveal>
      <Reveal distance={110} style={{ position: 'absolute', left: 224, top: 164 }}>
        <Bubble icon={Video} size={76} iconClassName="size-8" />
      </Reveal>
    </>
  );
}

const STEPS = [
  { icon: Store, title: 'Order placed', body: 'Your pharmacy confirms it', distance: 60 },
  { icon: Bike, title: 'Rider on the way', body: 'Follow them live', distance: 90 },
  { icon: PackageCheck, title: 'Delivered', body: 'Right to your door', distance: 120 },
];

function DeliveryIllustration() {
  const color = useColor();
  return (
    <>
      <Reveal
        distance={30}
        style={{ position: 'absolute', left: 71, top: 60, width: 2, height: 200 }}>
        <View style={{ flex: 1, borderRadius: 1, backgroundColor: `${color.primary}40` }} />
      </Reveal>
      {STEPS.map((step, i) => (
        <Reveal
          key={step.title}

          distance={step.distance}
          style={{ position: 'absolute', left: 36, top: 24 + i * 100, width: 248 }}>
          <Card
            style={{
              height: 72,
              borderRadius: 24,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              paddingHorizontal: 14,
            }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: color.secondary,
              }}>
              <Icon as={step.icon} className="size-5 text-primary" />
            </View>
            <View style={{ flex: 1 }}>
              <Text className="text-[15px] font-bold">{step.title}</Text>
              <Text className="text-[12px] text-muted-foreground">{step.body}</Text>
            </View>
          </Card>
        </Reveal>
      ))}
      <Reveal distance={110} style={{ position: 'absolute', left: 246, top: 0 }}>
        <Bubble icon={Pill} size={60} filled iconClassName="size-7" />
      </Reveal>
    </>
  );
}

const BEAT_BARS = [18, 26, 20, 32, 24, 30, 36];

function VitalsIllustration() {
  const color = useColor();
  return (
    <>
      <Reveal distance={50} style={{ position: 'absolute', left: 10, top: 12 }}>
        <Card style={{ width: 300, height: 124, borderRadius: 24, padding: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Icon as={HeartPulse} className="size-4 text-destructive" />
              <Text className="text-[14px] font-bold">Heart rate</Text>
            </View>
            <Text className="text-[13px] font-bold text-primary">72 bpm</Text>
          </View>
          <Svg width={268} height={60} viewBox="0 0 268 60" style={{ marginTop: 12 }}>
            <Path
              d="M0 34 H40 L52 34 L60 12 L70 54 L78 20 L86 34 H128 L140 34 L148 12 L158 54 L166 20 L174 34 H216 L228 34 L236 12 L246 54 L254 20 L262 34 H268"
              stroke={color.primary}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </Svg>
        </Card>
      </Reveal>
      <Reveal distance={80} style={{ position: 'absolute', left: 10, top: 150 }}>
        <Card style={{ width: 146, height: 112, borderRadius: 24, padding: 14 }}>
          <View
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text className="text-[12px] font-medium text-muted-foreground">Resting</Text>
            <Icon as={Activity} className="size-4 text-primary" />
          </View>
          <Text className="mt-4 text-[26px] font-extrabold tracking-tight">64</Text>
          <Text className="text-[12px] text-muted-foreground">bpm</Text>
        </Card>
      </Reveal>
      <Reveal distance={110} style={{ position: 'absolute', left: 164, top: 150 }}>
        <Card style={{ width: 146, height: 112, borderRadius: 24, padding: 14 }}>
          <View
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text className="text-[12px] font-medium text-muted-foreground">This week</Text>
            <Icon as={HeartPulse} className="size-4 text-primary" />
          </View>
          <Text className="mt-2 text-[22px] font-extrabold tracking-tight">
            71 <Text className="text-[12px] font-medium text-muted-foreground">avg bpm</Text>
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, marginTop: 6 }}>
            {BEAT_BARS.map((height, i) => (
              <View
                key={i}
                style={{
                  width: 10,
                  height,
                  borderRadius: 5,
                  backgroundColor:
                    i === BEAT_BARS.length - 1 ? color.primary : `${color.primary}33`,
                }}
              />
            ))}
          </View>
        </Card>
      </Reveal>
      <Reveal distance={90} style={{ position: 'absolute', left: 82, top: 276 }}>
        <Chip>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color.success }} />
          <Text className="text-[13px] font-semibold">Heart rate normal</Text>
        </Chip>
      </Reveal>
    </>
  );
}

export const SLIDES = [
  {
    title: 'All your healthcare needs, in one app',
    body: 'No more app-hopping. Book doctors, order medicine and book lab tests, all in one place.',
    cta: 'Get Started',
    Illustration: EverythingIllustration,
  },
  {
    title: 'See a doctor from anywhere',
    body: 'Video or voice consultations with verified doctors, whenever you need them.',
    cta: 'Next',
    Illustration: DoctorIllustration,
  },
  {
    title: 'Medicine delivered to your door',
    body: 'Order from pharmacies near you and follow your rider all the way to your door.',
    cta: 'Next',
    Illustration: DeliveryIllustration,
  },
  {
    title: 'Your health, on autopilot',
    body: 'Keep your records, vitals and reminders in one place, so nothing slips through.',
    cta: "Let's jump in",
    Illustration: VitalsIllustration,
  },
];
