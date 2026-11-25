import { useHomeProfile } from '@/api/home';
import { askLabs } from '@/api/labs';
import { ActionButton } from '@/components/shared/action-button';
import { Sheet } from '@/components/shared/sheet';
import { TextField } from '@/components/shared/text-field';
import { Text } from '@/components/ui/text';
import { AddressField } from '@/features/make-order/components/address-field';
import { areaOf, isLocationComplete } from '@/features/make-order/location';
import { EMPTY_LOCATION, type LocationDraft } from '@/features/make-order/types';
import { attempt } from '@/features/orders/actions';
import * as React from 'react';
import { Alert, View } from 'react-native';

const MAX_TESTS = 20;

// One test a line, or separated by commas.
const parseTests = (text: string) =>
  Array.from(
    new Set(
      text
        .split(/[\n,]/)
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0)
        .map((entry) => entry.slice(0, 120))
    )
  ).slice(0, MAX_TESTS);

// For a test no laboratory lists: the patient says what they need and where, and nearby labs reply.
export function AskPriceSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const profile = useHomeProfile();
  const [text, setText] = React.useState('');
  const [location, setLocation] = React.useState<LocationDraft>(EMPTY_LOCATION);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setText('');
    setLocation(EMPTY_LOCATION);
  }, [open]);

  const tests = parseTests(text);
  const ready = tests.length > 0 && isLocationComplete(location);

  async function send() {
    const row = profile.data;
    setBusy(true);
    const done = await attempt("Couldn't send your request", async () => {
      await askLabs({
        area: areaOf(location),
        collection: 'lab_visit',
        tests,
        ...(location.point ? { point: location.point } : {}),
        contactName:
          [row?.patientProfile?.firstName, row?.patientProfile?.lastName]
            .filter(Boolean)
            .join(' ') || 'Patient',
        contactPhone: row?.user.phone ?? '',
      });
      return true;
    });
    setBusy(false);
    if (!done) return;
    onClose();
    Alert.alert('Request sent', 'Laboratories near you will reply with a price.');
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      showClose
      hideFooterWithKeyboard
      divided
      snapPoints={['85%']}
      eyebrow="Lab tests"
      title="Ask for a price."
      subtitle="Tell us the tests you need. Laboratories near you reply with what they would charge."
      footer={
        <View className="gap-3">
          {ready ? null : (
            <Text className="text-muted-foreground text-xs">
              {tests.length === 0
                ? 'Add at least one test.'
                : 'Pick your location from the suggestions.'}
            </Text>
          )}
          <ActionButton
            size="md"
            label={busy ? 'Sending…' : 'Send request'}
            disabled={!ready || busy}
            onPress={send}
          />
        </View>
      }>
      <TextField
        sheet
        multiline
        label="Tests"
        hint="One test on each line"
        value={text}
        onChangeText={setText}
        autoCapitalize="sentences"
      />
      <AddressField label="Your location" value={location} onChange={setLocation} />
    </Sheet>
  );
}
