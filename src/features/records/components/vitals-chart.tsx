import { useColor } from '@/hooks/use-color';
import { FONT } from '@/lib/fonts';
import * as React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, Polyline, Text as SvgText } from 'react-native-svg';
import { dayLabel } from '../utils';

export type ChartSeries = { key: string; color: string; values: (number | null)[]; dashed?: boolean };

type VitalsChartProps = {
  ids: string[];
  atUtc: string[];
  series: ChartSeries[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

const HEIGHT = 190;
const PAD = { left: 34, right: 12, top: 14, bottom: 26 };
const GRID = 4;

export function VitalsChart({ ids, atUtc, series, selectedId, onSelect }: VitalsChartProps) {
  const color = useColor();
  const [width, setWidth] = React.useState(0);

  const all = series.flatMap((item) => item.values).filter((value): value is number => value !== null);
  const min = Math.min(...all);
  const max = Math.max(...all);
  const spread = Math.max(max - min, 10);
  const low = Math.floor(min - spread * 0.15);
  const high = Math.ceil(max + spread * 0.15);

  const innerW = Math.max(width - PAD.left - PAD.right, 1);
  const innerH = HEIGHT - PAD.top - PAD.bottom;
  const x = (index: number) =>
    PAD.left + (ids.length === 1 ? innerW / 2 : (innerW * index) / (ids.length - 1));
  const y = (value: number) => PAD.top + innerH - ((value - low) / (high - low)) * innerH;

  return (
    <View onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
      {width ? (
        <Svg width={width} height={HEIGHT}>
          {Array.from({ length: GRID + 1 }, (_, step) => {
            const value = low + ((high - low) * step) / GRID;
            return (
              <React.Fragment key={step}>
                <Line
                  x1={PAD.left}
                  x2={width - PAD.right}
                  y1={y(value)}
                  y2={y(value)}
                  stroke={color.border}
                  strokeWidth={1}
                />
                <SvgText
                  x={PAD.left - 6}
                  y={y(value) + 3.5}
                  fontSize={10}
                  fontFamily={FONT.medium}
                  fill={color.mutedForeground}
                  textAnchor="end">
                  {Math.round(value * 10) / 10}
                </SvgText>
              </React.Fragment>
            );
          })}
          {series.map((item) => {
            const points = item.values
              .map((value, index) => (value === null ? null : `${x(index)},${y(value)}`))
              .filter(Boolean)
              .join(' ');
            return (
              <Polyline
                key={item.key}
                points={points}
                fill="none"
                stroke={item.color}
                strokeWidth={2.2}
                strokeDasharray={item.dashed ? '5 4' : undefined}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            );
          })}
          {series.map((item) =>
            item.values.map((value, index) =>
              value === null ? null : (
                <Circle
                  key={`${item.key}-${ids[index]}`}
                  cx={x(index)}
                  cy={y(value)}
                  r={ids[index] === selectedId ? 5.5 : 3.5}
                  fill={ids[index] === selectedId ? color.card : item.color}
                  stroke={item.color}
                  strokeWidth={ids[index] === selectedId ? 2.5 : 0}
                />
              )
            )
          )}
          {ids.map((id, index) => (
            <Circle
              key={`hit-${id}`}
              cx={x(index)}
              cy={PAD.top + innerH / 2}
              r={Math.min(18, innerW / Math.max(ids.length, 1) / 2 + 4)}
              fill="transparent"
              onPress={() => onSelect(id)}
            />
          ))}
          <SvgText
            x={PAD.left}
            y={HEIGHT - 6}
            fontSize={10}
            fontFamily={FONT.medium}
            fill={color.mutedForeground}>
            {dayLabel(atUtc[0])}
          </SvgText>
          {ids.length > 1 ? (
            <SvgText
              x={width - PAD.right}
              y={HEIGHT - 6}
              fontSize={10}
              fontFamily={FONT.medium}
              fill={color.mutedForeground}
              textAnchor="end">
              {dayLabel(atUtc[atUtc.length - 1])}
            </SvgText>
          ) : null}
        </Svg>
      ) : (
        <View style={{ height: HEIGHT }} />
      )}
    </View>
  );
}
