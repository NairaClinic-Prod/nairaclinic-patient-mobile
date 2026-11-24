import * as React from 'react';
import { View } from 'react-native';

const FillContext = React.createContext(false);

export const useButtonFill = () => React.useContext(FillContext);

// Labelled buttons in here share the row: one fills the width, two split it, a third wraps onto its own full line.
export function ButtonRow({ children }: { children: React.ReactNode }) {
  return (
    <FillContext.Provider value>
      <View className="flex-row flex-wrap items-stretch gap-2">{children}</View>
    </FillContext.Provider>
  );
}
