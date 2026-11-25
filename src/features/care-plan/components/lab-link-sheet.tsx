import { useCreateLabLink, type LabLink } from '@/api/records';
import { ActionButton } from '@/components/shared/action-button';
import { CheckBox } from '@/components/shared/check-box';
import { PressableScale } from '@/components/shared/pressable-scale';
import { Sheet } from '@/components/shared/sheet';
import { TextField } from '@/components/shared/text-field';
import { Text } from '@/components/ui/text';
import { PATIENT_APP_URL } from '@/constants/links';
import * as Clipboard from 'expo-clipboard';
import * as Crypto from 'expo-crypto';
import * as Haptics from 'expo-haptics';
import { Copy, Share2 } from 'lucide-react-native';
import * as React from 'react';
import { Share, View } from 'react-native';
import { useCarePlan } from '../store';
import { closeCarePlanSheet, useCarePlanUi } from '../ui-store';
import { formatDateTime } from '../utils';

const LIFETIME_HOURS = 24;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const hex = (bytes: Uint8Array) =>
  Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
const sixDigits = (bytes: Uint8Array) =>
  Array.from(bytes, (byte) => String(byte % 100).padStart(2, '0')).join('');

// Gives a laboratory a one-time link and code to upload results for the picked tests themselves.
export function LabLinkSheet() {
  const ui = useCarePlanUi();
  const { encounters, labLinks } = useCarePlan();
  const create = useCreateLabLink();
  const open = ui.sheet === 'lab-link';
  const encounter = encounters.find((item) => item.id === ui.encounterId);
  const tests = React.useMemo(() => encounter?.tests ?? [], [encounter]);

  const [picked, setPicked] = React.useState<string[]>([]);
  const [labName, setLabName] = React.useState('');
  const [labEmail, setLabEmail] = React.useState('');
  const [created, setCreated] = React.useState<LabLink | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setPicked(ui.testId ? [ui.testId] : tests.map((test) => test.id));
    setLabName('');
    setLabEmail('');
    setCreated(null);
    setError(null);
    setCopied(null);
    // Only reset when the sheet opens for a consultation or test, not when the list refreshes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, ui.encounterId, ui.testId]);

  const now = new Date().toISOString();
  const active = labLinks.filter(
    (link) =>
      link.encounterId === ui.encounterId && !link.usedAt && !link.revokedAt && link.expiresAt > now
  );

  const missing = [
    ...(picked.length ? [] : ['At least one test']),
    ...(labName.trim() ? [] : ['Laboratory name']),
    ...(EMAIL.test(labEmail.trim()) ? [] : ['A valid laboratory email']),
  ];

  async function submit() {
    if (!ui.encounterId) return;
    setError(null);
    try {
      const slug = hex(await Crypto.getRandomBytesAsync(9));
      const accessCode = sixDigits(await Crypto.getRandomBytesAsync(3));
      const link = await create.mutateAsync({
        slug,
        encounterId: ui.encounterId,
        testIds: picked,
        labName: labName.trim(),
        labEmail: labEmail.trim(),
        url: `${PATIENT_APP_URL}/lab-upload/${slug}`,
        accessCode,
        expiresAt: new Date(Date.now() + LIFETIME_HOURS * 3_600_000).toISOString(),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCreated(link);
    } catch (failure) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(failure instanceof Error ? failure.message : "Couldn't create the link.");
    }
  }

  async function copy(label: string, text: string) {
    await Clipboard.setStringAsync(text);
    Haptics.selectionAsync();
    setCopied(label);
  }

  const linkBlock = (link: LabLink) => (
    <View key={link.id} className="gap-2.5 rounded-2xl bg-muted p-3.5">
      <Text className="text-[13px] font-bold">{link.labName}</Text>
      <Text className="text-[11px] text-muted-foreground">
        {`Expires ${formatDateTime(link.expiresAt)} · One submission, selected tests only`}
      </Text>
      <Text className="text-xs" selectable numberOfLines={2}>
        {link.url}
      </Text>
      <Text className="text-lg font-extrabold tracking-widest" selectable>
        {link.accessCode}
      </Text>
      <View className="flex-row flex-wrap gap-2">
        <ActionButton
          label={copied === `link-${link.id}` ? 'Link copied' : 'Copy link'}
          icon={Copy}
          variant="outline"
          onPress={() => copy(`link-${link.id}`, link.url)}
        />
        <ActionButton
          label={copied === `code-${link.id}` ? 'Code copied' : 'Copy code'}
          icon={Copy}
          variant="outline"
          onPress={() => copy(`code-${link.id}`, link.accessCode)}
        />
        <ActionButton
          label="Share link"
          icon={Share2}
          variant="ghost"
          onPress={() => Share.share({ message: `Upload my test results here: ${link.url}` })}
        />
      </View>
    </View>
  );

  return (
    <Sheet
      open={open}
      onClose={closeCarePlanSheet}
      title={created ? 'Link ready' : 'Lab upload link'}
      subtitle={
        created
          ? `Send the link to ${created.labName}. Share the access code separately, for example by phone call.`
          : 'Let a laboratory upload results for these tests without an account.'
      }
      snapPoints={['76%']}
      footer={
        created ? (
          <ActionButton size="md" label="Done" onPress={closeCarePlanSheet} />
        ) : (
          <View className="gap-2">
            {error ? <Text className="text-xs text-destructive">{error}</Text> : null}
            {missing.length ? (
              <Text className="text-xs text-muted-foreground">{`Still needed: ${missing.join(', ')}.`}</Text>
            ) : null}
            <View className="flex-row gap-2">
              <ActionButton
                size="md"
                label="Cancel"
                variant="outline"
                className="flex-1"
                onPress={closeCarePlanSheet}
              />
              <ActionButton
                size="md"
                label={create.isPending ? 'Creating…' : 'Create link'}
                className="flex-[2]"
                disabled={missing.length > 0 || create.isPending}
                onPress={submit}
              />
            </View>
          </View>
        )
      }>
      {created ? (
        linkBlock(created)
      ) : (
        <>
          <Text className="text-xs font-semibold text-muted-foreground">
            Tests the lab can upload
          </Text>
          {tests.map((test) => {
            const checked = picked.includes(test.id);
            return (
              <PressableScale
                key={test.id}
                scaleTo={0.98}
                role="checkbox"
                accessibilityState={{ checked }}
                onPress={() =>
                  setPicked((current) =>
                    checked ? current.filter((id) => id !== test.id) : [...current, test.id]
                  )
                }
                className="flex-row items-center gap-3">
                <CheckBox checked={checked} />
                <Text className="flex-1 text-[13px]">{test.name}</Text>
              </PressableScale>
            );
          })}
          <TextField
            sheet
            tone="muted"
            label="Laboratory name"
            required
            placeholder="e.g. Union Diagnostics"
            value={labName}
            onChangeText={setLabName}
          />
          <TextField
            sheet
            tone="muted"
            label="Laboratory email"
            required
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="results@lab.com"
            value={labEmail}
            onChangeText={setLabEmail}
          />
          {active.length ? (
            <>
              <Text className="text-xs font-semibold text-muted-foreground">Active links</Text>
              {active.map(linkBlock)}
            </>
          ) : null}
        </>
      )}
    </Sheet>
  );
}
