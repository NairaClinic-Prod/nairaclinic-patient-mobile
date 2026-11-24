import { ActionButton } from '@/components/patterns/action-button';
import { ButtonRow } from '@/components/patterns/button-row';
import { ChipTabs } from '@/components/patterns/chip-tabs';
import { SegmentedControl } from '@/components/patterns/segmented-control';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Droplet, Gauge, History, Plus, type LucideIcon } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, View } from 'react-native';
import { COLORS, LIMITS, TIMING_LABEL } from '../constants';
import type { BpReading, Reading, SugarReading, SugarTiming, SugarUnit, VitalView } from '../types';
import { dayLabel, stampLabel, toUnit } from '../utils';
import { VitalsChart, type ChartSeries } from './vitals-chart';

type VitalsCardProps = {
  readings: Reading[];
  onAdd: (view: VitalView) => void;
  onViewAll: (view: VitalView) => void;
};

type TileProps = {
  selected: boolean;
  icon: LucideIcon;
  title: string;
  value: string;
  unit: string;
  extra?: string;
  stamp: string;
  onPress: () => void;
};

function VitalTile({ selected, icon, title, value, unit, extra, stamp, onPress }: TileProps) {
  return (
    <Pressable
      role="tab"
      accessibilityState={{ selected }}
      onPress={onPress}
      className={cn(
        'min-w-0 flex-1 gap-2 rounded-2xl border-2 p-3 active:opacity-80',
        selected ? 'border-primary bg-secondary/60' : 'border-border bg-card'
      )}>
      <View className="flex-row items-center gap-1.5">
        <Icon as={icon} className="text-primary size-4" />
        <Text className="flex-1 text-xs font-semibold" numberOfLines={1}>
          {title}
        </Text>
      </View>
      <View className="flex-row flex-wrap items-baseline gap-x-1.5">
        <Text className="text-[22px] font-extrabold leading-7">{value}</Text>
        <Text className="text-muted-foreground text-xs">{unit}</Text>
      </View>
      {extra ? <Text className="text-muted-foreground text-xs">{extra}</Text> : null}
      <Text className="text-muted-foreground text-[11px]" numberOfLines={1}>
        {stamp}
      </Text>
    </Pressable>
  );
}

function Value({ label, value, unit, color }: { label: string; value: string; unit: string; color?: string }) {
  return (
    <View>
      <Text className="text-muted-foreground text-[11px]">{label}</Text>
      <View className="flex-row items-baseline gap-1">
        <Text className="text-xl font-extrabold" style={color ? { color } : undefined}>
          {value}
        </Text>
        <Text className="text-muted-foreground text-[11px]">{unit}</Text>
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
      <Text className="text-muted-foreground text-xs">{label}</Text>
    </View>
  );
}

export function VitalsCard({ readings, onAdd, onViewAll }: VitalsCardProps) {
  const [view, setView] = React.useState<VitalView>('bp');
  const [limit, setLimit] = React.useState<(typeof LIMITS)[number]>('7');
  const [unit, setUnit] = React.useState<SugarUnit>('mg/dL');
  const [timing, setTiming] = React.useState<SugarTiming | 'all'>('all');
  const [picked, setPicked] = React.useState<string | null>(null);

  const bp = readings.filter((reading): reading is BpReading => reading.kind === 'bp');
  const sugar = readings.filter((reading): reading is SugarReading => reading.kind === 'sugar');
  const latestBp = bp[0];
  const latestSugar = sugar[0];

  const list: Reading[] =
    view === 'bp' ? bp : sugar.filter((reading) => timing === 'all' || reading.timing === timing);
  const series = list.slice(0, Number(limit)).reverse();
  const current = series.find((reading) => reading.id === picked) ?? series[series.length - 1];
  const position = current ? series.indexOf(current) : -1;

  const chartSeries: ChartSeries[] =
    view === 'bp'
      ? [
          { key: 'sys', color: COLORS.systolic, values: (series as BpReading[]).map((r) => r.systolic) },
          { key: 'dia', color: COLORS.diastolic, values: (series as BpReading[]).map((r) => r.diastolic) },
          { key: 'pulse', color: COLORS.pulse, dashed: true, values: (series as BpReading[]).map((r) => r.pulse) },
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
    <View className="bg-card gap-4 rounded-2xl p-4">
      <View className="flex-row items-start justify-between gap-3">
        <View className="min-w-0 flex-1">
          <Text className="text-lg font-extrabold">My vitals</Text>
          <Text className="text-muted-foreground mt-0.5 text-xs">Your readings, together over time.</Text>
        </View>
        <ActionButton label="Add reading" icon={Plus} onPress={() => onAdd(view)} />
      </View>

      <View role="tablist" className="flex-row gap-2.5">
        <VitalTile
          selected={view === 'bp'}
          icon={Gauge}
          title="Blood pressure & pulse"
          value={latestBp ? `${latestBp.systolic}/${latestBp.diastolic}` : '—'}
          unit="mmHg"
          extra={latestBp?.pulse ? `${latestBp.pulse} bpm` : undefined}
          stamp={latestBp ? dayLabel(latestBp.atUtc) : 'No readings yet'}
          onPress={() => {
            setView('bp');
            setPicked(null);
          }}
        />
        <VitalTile
          selected={view === 'sugar'}
          icon={Droplet}
          title="Blood sugar"
          value={latestSugar ? String(toUnit(latestSugar.sugar, unit)) : '—'}
          unit={unit}
          extra={latestSugar ? TIMING_LABEL[latestSugar.timing] : undefined}
          stamp={latestSugar ? dayLabel(latestSugar.atUtc) : 'No readings yet'}
          onPress={() => {
            setView('sugar');
            setPicked(null);
          }}
        />
      </View>

      <View className="gap-3">
        <View className="flex-row items-center justify-between gap-3">
          <View className="min-w-0 flex-1">
            <Text className="text-[15px] font-bold">
              {view === 'bp' ? 'Blood pressure & pulse' : 'Blood sugar'}
            </Text>
            <Text className="text-muted-foreground text-xs">
              {`Last ${series.length} ${series.length === 1 ? 'reading' : 'readings'}`}
            </Text>
          </View>
        </View>

        <SegmentedControl
          value={limit}
          onChange={(next) => {
            setLimit(next);
            setPicked(null);
          }}
          options={LIMITS.map((value) => ({ value, label: `Last ${value}` }))}
        />

        {view === 'sugar' ? (
          <View className="gap-2.5">
            <SegmentedControl
              value={unit}
              onChange={setUnit}
              options={[
                { value: 'mg/dL', label: 'mg/dL' },
                { value: 'mmol/L', label: 'mmol/L' },
              ]}
            />
            <ChipTabs
              gutter={16}
              value={timing}
              onChange={(next) => {
                setTiming(next);
                setPicked(null);
              }}
              options={[
                { value: 'all' as const, label: 'All timings' },
                ...(Object.entries(TIMING_LABEL) as [SugarTiming, string][]).map(([value, label]) => ({
                  value,
                  label,
                })),
              ]}
            />
          </View>
        ) : null}

        {current ? (
          <>
            <VitalsChart
              ids={series.map((reading) => reading.id)}
              atUtc={series.map((reading) => reading.atUtc)}
              series={chartSeries}
              selectedId={current.id}
              onSelect={setPicked}
            />
            <View className="bg-muted gap-2 rounded-2xl p-3.5">
              <Text className="text-muted-foreground text-[11px]">{stampLabel(current.atUtc)}</Text>
              {current.kind === 'bp' ? (
                <View className="flex-row gap-6">
                  <Value
                    label="Blood pressure"
                    value={`${current.systolic}/${current.diastolic}`}
                    unit="mmHg"
                    color={COLORS.systolic}
                  />
                  {current.pulse ? (
                    <Value label="Pulse" value={String(current.pulse)} unit="bpm" color={COLORS.pulse} />
                  ) : null}
                </View>
              ) : (
                <View className="flex-row gap-6">
                  <Value
                    label="Blood sugar"
                    value={String(toUnit(current.sugar, unit))}
                    unit={unit}
                    color={COLORS.sugar}
                  />
                  <View>
                    <Text className="text-muted-foreground text-[11px]">Timing</Text>
                    <Text className="mt-0.5 text-sm font-semibold">{TIMING_LABEL[current.timing]}</Text>
                  </View>
                </View>
              )}
              {current.note ? (
                <Text className="text-muted-foreground text-xs leading-[18px]">{current.note}</Text>
              ) : null}
            </View>
            {view === 'bp' ? (
              <View className="flex-row flex-wrap items-center gap-x-4 gap-y-1.5">
                <Legend color={COLORS.systolic} label="Systolic" />
                <Legend color={COLORS.diastolic} label="Diastolic" />
                <Legend color={COLORS.pulse} label="Pulse" dashed />
              </View>
            ) : (
              <Text className="text-muted-foreground text-xs">{`Blood sugar · ${unit}`}</Text>
            )}
            <View className="flex-row items-center justify-between">
              <ActionButton
                label="View all"
                icon={History}
                variant="ghost"
                onPress={() => onViewAll(view)}
              />
              <View className="flex-row items-center gap-2">
                <Text className="text-muted-foreground text-xs">
                  {`${position + 1} of ${series.length}`}
                </Text>
                <ActionButton
                  icon={ChevronLeft}
                  variant="outline"
                  accessibilityLabel="Previous reading"
                  disabled={position <= 0}
                  onPress={() => step(-1)}
                />
                <ActionButton
                  icon={ChevronRight}
                  variant="outline"
                  accessibilityLabel="Next reading"
                  disabled={position >= series.length - 1}
                  onPress={() => step(1)}
                />
              </View>
            </View>
          </>
        ) : (
          <View className="border-border items-center gap-3 rounded-2xl border border-dashed px-4 py-10">
            <Text className="text-muted-foreground text-center text-sm">
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
