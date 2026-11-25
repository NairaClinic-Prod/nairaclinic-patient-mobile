import { PressableScale } from '@/components/shared/pressable-scale';
import { ActionButton } from '@/components/shared/action-button';
import { ButtonRow } from '@/components/shared/button-row';
import { InlineSelect } from '@/components/shared/inline-select';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  Droplet,
  Gauge,
  History,
  Plus,
  type LucideIcon,
} from 'lucide-react-native';
import * as React from 'react';
import { View } from 'react-native';
import { COLORS, LIMITS, TIMING_LABEL } from '../constants';
import type { BpReading, Reading, SugarReading, SugarTiming, SugarUnit, VitalView } from '../types';
import { dayLabel, stampLabel, toUnit } from '../utils';
import { VitalsChart, type ChartSeries } from './vitals-chart';

type VitalsCardProps = {
  readings: Reading[];
  onAdd: (view: VitalView) => void;
  onViewAll: (view: VitalView) => void;
  dismissRef?: React.RefObject<(() => void) | null>;
  chartTouch?: React.RefObject<boolean>;
};

type TileProps = {
  selected: boolean;
  tint?: boolean;
  grow: number;
  icon: LucideIcon;
  title: string;
  stamp: string;
  onPress: () => void;
  children: React.ReactNode;
};

function VitalTile({ selected, tint, grow, icon, title, stamp, onPress, children }: TileProps) {
  return (
    <PressableScale
      scaleTo={0.98}
      role="tab"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={{ flexGrow: grow, flexBasis: 0 }}
      className={cn(
        'min-w-0 justify-between gap-2 rounded-2xl border-2 p-3',
        selected ? 'border-primary' : 'border-transparent',
        tint ? 'bg-secondary/70' : selected ? 'bg-secondary/50' : 'bg-muted/60'
      )}>
      {selected ? (
        <View className="absolute top-3 right-3 size-1.5 rounded-full bg-primary" />
      ) : null}
      <View className="flex-row items-center gap-1.5 pr-3">
        <Icon as={icon} className="size-4 text-primary" />
        <Text className="flex-1 text-xs font-semibold text-foreground/80" numberOfLines={1}>
          {title}
        </Text>
      </View>
      {children}
      <Text className="text-xs text-muted-foreground" numberOfLines={1}>
        {stamp}
      </Text>
    </PressableScale>
  );
}

function Metric({ value, unit, color }: { value: string; unit: string; color?: string }) {
  return (
    <View>
      <Text
        className="text-[22px] leading-7 font-extrabold"
        numberOfLines={1}
        style={color ? { color } : undefined}>
        {value}
      </Text>
      <Text className="text-xs leading-4" style={color ? { color } : undefined}>
        {unit}
      </Text>
    </View>
  );
}

function Value({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: string;
  unit: string;
  color?: string;
}) {
  return (
    <View>
      <Text className="text-[11px] text-muted-foreground">{label}</Text>
      <View className="flex-row items-baseline gap-1">
        <Text className="text-xl font-extrabold" style={color ? { color } : undefined}>
          {value}
        </Text>
        <Text className="text-[11px] text-muted-foreground">{unit}</Text>
      </View>
    </View>
  );
}

function Legend({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <View className="flex-row items-center gap-1.5">
      <View
        style={{
          width: 16,
          height: 0,
          borderTopWidth: 2.5,
          borderColor: color,
          borderStyle: dashed ? 'dashed' : 'solid',
        }}
      />
      <Text className="text-xs text-muted-foreground">{label}</Text>
    </View>
  );
}

export function VitalsCard({
  readings,
  onAdd,
  onViewAll,
  dismissRef,
  chartTouch,
}: VitalsCardProps) {
  const [view, setView] = React.useState<VitalView>('bp');
  const [limit, setLimit] = React.useState<(typeof LIMITS)[number]>('7');
  const [unit, setUnit] = React.useState<SugarUnit>('mg/dL');
  const [timing, setTiming] = React.useState<SugarTiming | 'all'>('all');
  const [picked, setPicked] = React.useState<string | null>(null);

  // The screen calls this on any touch outside the chart; clearing an empty pick changes nothing, so nothing re-renders.
  React.useEffect(() => {
    if (!dismissRef) return;
    dismissRef.current = () => setPicked(null);
    return () => {
      dismissRef.current = null;
    };
  }, [dismissRef]);

  const bp = readings.filter((reading): reading is BpReading => reading.kind === 'bp');
  const sugar = readings.filter((reading): reading is SugarReading => reading.kind === 'sugar');
  const latestBp = bp[0];
  const latestSugar = sugar[0];

  const list: Reading[] =
    view === 'bp' ? bp : sugar.filter((reading) => timing === 'all' || reading.timing === timing);
  const series = list.slice(0, Number(limit)).reverse();
  const selected = series.find((reading) => reading.id === picked) ?? null;
  const current = selected ?? series[series.length - 1];
  const position = current ? series.indexOf(current) : -1;

  const chartSeries: ChartSeries[] =
    view === 'bp'
      ? [
          {
            key: 'sys',
            color: COLORS.systolic,
            values: (series as BpReading[]).map((r) => r.systolic),
          },
          {
            key: 'dia',
            color: COLORS.diastolic,
            values: (series as BpReading[]).map((r) => r.diastolic),
          },
          {
            key: 'pulse',
            color: COLORS.pulse,
            dashed: true,
            values: (series as BpReading[]).map((r) => r.pulse),
          },
        ]
      : [
          {
            key: 'sugar',
            color: COLORS.sugar,
            values: (series as SugarReading[]).map((r) => toUnit(r.sugar, unit)),
          },
        ];

  const step = (delta: number) => {
    const next = series[position + delta];
    if (next) setPicked(next.id);
  };

  return (
    <View className="gap-4">
      <View className="flex-row items-start justify-between gap-3">
        <View className="min-w-0 flex-1">
          <Text className="text-lg font-extrabold">My vitals</Text>
          <Text className="mt-0.5 text-xs text-muted-foreground">
            Your readings, together over time.
          </Text>
        </View>
        <ActionButton label="Add reading" icon={Plus} onPress={() => onAdd(view)} />
      </View>

      <View role="tablist" className="flex-row gap-2.5">
        <VitalTile
          selected={view === 'bp'}
          grow={1.8}
          icon={Gauge}
          title="Blood pressure & pulse"
          stamp={latestBp ? dayLabel(latestBp.atUtc) : 'No readings yet'}
          onPress={() => {
            setView('bp');
            setPicked(null);
          }}>
          <View className="flex-row items-center gap-2">
            <View className="min-w-0 flex-[1.5]">
              <Metric
                value={latestBp ? `${latestBp.systolic}/${latestBp.diastolic}` : '—'}
                unit="mmHg"
              />
            </View>
            <View className="min-w-0 flex-1 border-l border-border pl-2">
              <Metric value={String(latestBp?.pulse ?? '—')} unit="bpm" color={COLORS.pulse} />
            </View>
          </View>
        </VitalTile>
        <VitalTile
          tint
          selected={view === 'sugar'}
          grow={1}
          icon={Droplet}
          title="Blood sugar"
          stamp={latestSugar ? dayLabel(latestSugar.atUtc) : 'No readings yet'}
          onPress={() => {
            setView('sugar');
            setPicked(null);
          }}>
          <Metric value={latestSugar ? String(toUnit(latestSugar.sugar, unit)) : '—'} unit={unit} />
        </VitalTile>
      </View>

      <View className="gap-3">
        <View className="flex-row items-start justify-between gap-3">
          <View className="min-w-0 flex-1">
            <Text className="text-[15px] font-bold">
              {view === 'bp' ? 'Blood pressure & pulse' : 'Blood sugar'}
            </Text>
            <Text className="text-xs text-muted-foreground">
              {`${series.length} ${series.length === 1 ? 'reading' : 'readings'}${
                series.length ? ' · Tap for values' : ''
              }`}
            </Text>
          </View>
          <InlineSelect
            title="Number of readings"
            value={limit}
            options={LIMITS.map((value) => ({ value, label: `Last ${value}` }))}
            onChange={(next) => {
              setLimit(next);
              setPicked(null);
            }}
          />
        </View>

        {view === 'sugar' ? (
          <View className="flex-row flex-wrap items-center gap-x-5 gap-y-2 rounded-2xl bg-muted p-2.5">
            <InlineSelect
              label="Unit"
              value={unit}
              options={[
                { value: 'mg/dL', label: 'mg/dL' },
                { value: 'mmol/L', label: 'mmol/L' },
              ]}
              onChange={setUnit}
            />
            <InlineSelect
              label="Timing"
              value={timing}
              options={[
                { value: 'all' as const, label: 'All timings' },
                ...(Object.entries(TIMING_LABEL) as [SugarTiming, string][]).map(
                  ([value, label]) => ({
                    value,
                    label,
                  })
                ),
              ]}
              onChange={(next) => {
                setTiming(next);
                setPicked(null);
              }}
            />
          </View>
        ) : null}

        {current ? (
          <>
            <View className="flex-row items-center justify-between">
              <Text className="text-[11px] text-muted-foreground">
                {view === 'bp' ? 'Blood pressure · mmHg' : unit}
              </Text>
              {view === 'bp' ? (
                <Text className="text-[11px]" style={{ color: COLORS.pulse }}>
                  Pulse · bpm
                </Text>
              ) : null}
            </View>
            <VitalsChart
              ids={series.map((reading) => reading.id)}
              atUtc={series.map((reading) => reading.atUtc)}
              series={chartSeries}
              onTouch={() => {
                if (chartTouch) chartTouch.current = true;
              }}
              selectedId={selected?.id ?? null}
              onSelect={(id) => setPicked((now) => (now === id ? null : id))}
              overlay={
                !selected ? null : (
                  <View className="gap-1.5 rounded-xl border border-border/60 bg-card/90 px-3 py-2.5 shadow-md shadow-black/10">
                    <Text className="text-[11px] text-muted-foreground">
                      {stampLabel(current.atUtc)}
                    </Text>
                    {current.kind === 'bp' ? (
                      <View className="flex-row items-stretch gap-3">
                        <Value
                          label="Blood pressure"
                          value={`${current.systolic}/${current.diastolic}`}
                          unit="mmHg"
                          color={COLORS.systolic}
                        />
                        {current.pulse ? (
                          <>
                            <View className="w-px bg-border" />
                            <Value
                              label="Pulse"
                              value={String(current.pulse)}
                              unit="bpm"
                              color={COLORS.pulse}
                            />
                          </>
                        ) : null}
                      </View>
                    ) : (
                      <View className="flex-row items-stretch gap-3">
                        <Value
                          label="Blood sugar"
                          value={String(toUnit(current.sugar, unit))}
                          unit={unit}
                          color={COLORS.sugar}
                        />
                        <View className="w-px bg-border" />
                        <View>
                          <Text className="text-[11px] text-muted-foreground">Timing</Text>
                          <Text className="mt-0.5 text-sm font-semibold">
                            {TIMING_LABEL[current.timing]}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                )
              }
            />
            <View className="flex-row flex-wrap items-center justify-between gap-3">
              {view === 'bp' ? (
                <View className="flex-row flex-wrap items-center gap-x-4 gap-y-1.5">
                  <Legend color={COLORS.systolic} label="Systolic" />
                  <Legend color={COLORS.diastolic} label="Diastolic" />
                  <Legend color={COLORS.pulse} label="Pulse" dashed />
                </View>
              ) : (
                <Text className="text-xs text-muted-foreground">{`Blood sugar · ${unit}`}</Text>
              )}
              <ActionButton
                label=""
                icon={History}
                variant="ghost"
                onPress={() => onViewAll(view)}
              />
            </View>
            <View className="flex-row items-center justify-between border-t border-border/70 pt-3">
              <Text className="text-xs text-muted-foreground">
                {`Reading ${position + 1} of ${series.length}`}
              </Text>
              <View className="flex-row gap-1">
                <ActionButton
                  icon={ChevronLeft}
                  variant="ghost"
                  accessibilityLabel="Previous reading"
                  disabled={position <= 0}
                  onPress={() => step(-1)}
                />
                <ActionButton
                  icon={ChevronRight}
                  variant="ghost"
                  accessibilityLabel="Next reading"
                  disabled={position >= series.length - 1}
                  onPress={() => step(1)}
                />
              </View>
            </View>
          </>
        ) : (
          <View className="items-center gap-3 rounded-2xl border border-dashed border-border px-4 py-10">
            <Text className="text-center text-sm text-muted-foreground">
              {view === 'bp' || timing === 'all'
                ? 'No readings yet. Add your first one to see it here.'
                : 'No readings with this timing.'}
            </Text>
            <View className="w-full">
              <ButtonRow>
                <ActionButton label="Add reading" icon={Plus} onPress={() => onAdd(view)} />
              </ButtonRow>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
