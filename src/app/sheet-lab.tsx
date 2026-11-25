import { Sheet } from '@/components/shared/sheet';
import { Text } from '@/components/ui/text';
import * as React from 'react';
import { Dimensions, View, type HostInstance } from 'react-native';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function SheetLab() {
  const [a, setA] = React.useState(false);
  const [b, setB] = React.useState(false);
  const [, setTick] = React.useState(0);
  const [storm, setStorm] = React.useState(false);
  const [log, setLog] = React.useState<string[]>([]);
  const refA = React.useRef<HostInstance>(null);
  const refB = React.useRef<HostInstance>(null);

  React.useEffect(() => {
    if (!storm) return;
    const timer = setInterval(() => setTick((value) => value + 1), 40);
    return () => clearInterval(timer);
  }, [storm]);

  React.useEffect(() => {
    const screen = Dimensions.get('window').height;
    const seen = (ref: React.RefObject<HostInstance | null>) =>
      new Promise<boolean>((resolve) => {
        if (!ref.current) return resolve(false);
        ref.current.measureInWindow((_x, y, _w, h) => resolve(h > 0 && y < screen - 20));
      });
    let fails = 0;
    const check = async (label: string, ref: React.RefObject<HostInstance | null>, want: boolean) => {
      const got = await seen(ref);
      if (got !== want) fails += 1;
      const line = `${got === want ? 'ok  ' : 'FAIL'} ${label} want=${want} got=${got}`;
      console.log(`[sheet-lab] ${line}`);
      setLog((current) => [...current.slice(-14), line]);
    };

    (async () => {
      await wait(1500);
      for (let i = 0; i < 8; i += 1) {
        setA(true);
        await wait(900);
        await check(`cycle ${i} open`, refA, true);
        setA(false);
        await wait(900);
        await check(`cycle ${i} closed`, refA, false);
      }
      for (let i = 0; i < 8; i += 1) {
        setA(true);
        await wait(60);
        setA(false);
        await wait(40);
        setA(true);
        await wait(1000);
        await check(`rapid ${i} open`, refA, true);
        setA(false);
        await wait(900);
        await check(`rapid ${i} closed`, refA, false);
      }
      for (let i = 0; i < 5; i += 1) {
        setA(true);
        await wait(900);
        setA(false);
        setB(true);
        await wait(1000);
        await check(`swap ${i} B open`, refB, true);
        await check(`swap ${i} A closed`, refA, false);
        setB(false);
        setA(true);
        await wait(1000);
        await check(`swap ${i} A back`, refA, true);
        setA(false);
        await wait(900);
      }
      setStorm(true);
      for (let i = 0; i < 6; i += 1) {
        setA(true);
        await wait(900);
        await check(`storm ${i} open`, refA, true);
        setA(false);
        await wait(900);
        await check(`storm ${i} closed`, refA, false);
      }
      setStorm(false);
      console.log(`[sheet-lab] DONE fails=${fails}`);
      setLog((current) => [...current, `DONE fails=${fails}`]);
    })();
  }, []);

  return (
    <View style={{ flex: 1, paddingTop: 80, paddingHorizontal: 20 }} className="bg-background">
      <Text className="text-lg font-bold">Sheet lab</Text>
      {log.map((line, index) => (
        <Text key={index} className="text-xs">
          {line}
        </Text>
      ))}
      <Sheet open={a} onClose={() => setA(false)} title="Sheet A">
        <View ref={refA} collapsable={false} style={{ height: 120 }}>
          <Text>Content A</Text>
        </View>
      </Sheet>
      <Sheet open={b} onClose={() => setB(false)} title="Sheet B" snapPoints={['50%']}>
        <View ref={refB} collapsable={false} style={{ height: 120 }}>
          <Text>Content B</Text>
        </View>
      </Sheet>
    </View>
  );
}
