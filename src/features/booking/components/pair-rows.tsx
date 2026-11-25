import * as React from 'react';
import { View } from 'react-native';

type PairRowsProps = { gap?: number; children: React.ReactNode };

// A steady two-column grid. Every row shares one height and a lone last item keeps its half.
export function PairRows({ gap = 12, children }: PairRowsProps) {
  const items = React.Children.toArray(children);
  const rows: React.ReactNode[][] = [];
  for (let index = 0; index < items.length; index += 2) rows.push(items.slice(index, index + 2));

  return (
    <View style={{ gap }}>
      {rows.map((row, index) => (
        <View key={index} className="flex-row" style={{ gap }}>
          {[0, 1].map((slot) => (
            <View key={slot} className="flex-1">
              {row[slot] ?? null}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}
