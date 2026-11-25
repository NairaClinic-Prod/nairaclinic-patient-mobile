import { useAttachResults, type UploadFile } from '@/api/records';
import { ActionButton } from '@/components/shared/action-button';
import { CheckBox } from '@/components/shared/check-box';
import { PressableScale } from '@/components/shared/pressable-scale';
import { Sheet } from '@/components/shared/sheet';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import * as DocumentPicker from 'expo-document-picker';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { Camera, CircleCheck, FileText, Folder, Image as ImageIcon, X } from 'lucide-react-native';
import * as React from 'react';
import { View } from 'react-native';
import { useCarePlan } from '../store';
import { closeCarePlanSheet, openAttachedResults, useCarePlanUi } from '../ui-store';
import { plural } from '../utils';

const MAX_FILES = 5;
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_TOTAL_BYTES = 25 * 1024 * 1024;
const TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/heic', 'image/heif'];

type Picked = UploadFile & { size: number };

const megabytes = (bytes: number) => `${Math.round((bytes / 1024 / 1024) * 10) / 10} MB`;
const kilobytes = (bytes: number) =>
  bytes >= 1024 * 1024 ? megabytes(bytes) : `${Math.max(1, Math.round(bytes / 1024))} KB`;

function problemWith(files: Picked[]): string | null {
  if (files.length > MAX_FILES) return `You can upload up to ${MAX_FILES} files at a time.`;
  const bad = files.find((file) => !TYPES.includes(file.type));
  if (bad) return `${bad.name} isn't a PDF, JPG, PNG or HEIC.`;
  const big = files.find((file) => file.size > MAX_FILE_BYTES);
  if (big) return `${big.name} is over ${megabytes(MAX_FILE_BYTES)}.`;
  if (files.reduce((sum, file) => sum + file.size, 0) > MAX_TOTAL_BYTES) {
    return `Files together can't be over ${megabytes(MAX_TOTAL_BYTES)}.`;
  }
  return null;
}

const guessType = (name: string, type?: string | null) => {
  if (type) return type === 'image/jpg' ? 'image/jpeg' : type;
  const ext = name.split('.').pop()?.toLowerCase();
  return ext === 'pdf'
    ? 'application/pdf'
    : ext === 'png'
      ? 'image/png'
      : ext === 'heic'
        ? 'image/heic'
        : 'image/jpeg';
};

// Attaches result reports to the right tests of one consultation: pick files, tick which tests each covers, upload.
export function UploadResultsSheet() {
  const ui = useCarePlanUi();
  const { encounters } = useCarePlan();
  const attach = useAttachResults();
  const open = ui.sheet === 'upload';
  const encounter = encounters.find((item) => item.id === ui.encounterId);
  const tests = React.useMemo(() => encounter?.tests ?? [], [encounter]);

  const [files, setFiles] = React.useState<Picked[]>([]);
  const [matches, setMatches] = React.useState<Record<string, string[]>>({});
  const [error, setError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState(0);

  React.useEffect(() => {
    if (!open) return;
    setFiles([]);
    setMatches({});
    setError(null);
    setDone(0);
  }, [open, ui.encounterId, ui.testId]);

  // A file starts matched to the test it was opened from, or to the only test there is.
  const startingMatch = ui.testId ? [ui.testId] : tests.length === 1 ? [tests[0]!.id] : [];

  function add(added: Picked[]) {
    const known = new Set(files.map((file) => file.uri));
    const fresh = added.filter((file) => !known.has(file.uri));
    const next = [...files, ...fresh];
    const problem = problemWith(next);
    setError(problem);
    if (problem) return;
    setFiles(next);
    setMatches((current) => ({
      ...Object.fromEntries(fresh.map((file) => [file.uri, startingMatch])),
      ...current,
    }));
  }

  async function chooseFiles() {
    const result = await DocumentPicker.getDocumentAsync({
      type: TYPES,
      multiple: true,
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;
    add(
      result.assets.map((asset) => ({
        uri: asset.uri,
        name: asset.name,
        type: guessType(asset.name, asset.mimeType),
        size: asset.size ?? 0,
      }))
    );
  }

  async function choosePhotos(camera: boolean) {
    const permission = camera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError(
        camera
          ? 'Camera access is off. Turn it on in your phone settings to take a photo.'
          : 'Photo access is off. Turn it on in your phone settings to choose a photo.'
      );
      return;
    }
    const result = camera
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.85 })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsMultipleSelection: true,
          selectionLimit: MAX_FILES,
          quality: 0.85,
        });
    if (result.canceled) return;
    add(
      result.assets.map((asset, index) => {
        const name = asset.fileName ?? `Result ${Date.now()}-${index + 1}.jpg`;
        return {
          uri: asset.uri,
          name,
          type: guessType(name, asset.mimeType),
          size: asset.fileSize ?? 0,
        };
      })
    );
  }

  const toggle = (uri: string, testId: string) =>
    setMatches((current) => {
      const now = current[uri] ?? [];
      return {
        ...current,
        [uri]: now.includes(testId) ? now.filter((id) => id !== testId) : [...now, testId],
      };
    });

  const unmatched = files.some((file) => !(matches[file.uri] ?? []).length);

  async function submit() {
    if (!ui.encounterId) return;
    setError(null);
    try {
      await attach.mutateAsync(
        files.map((file) => ({
          file: { uri: file.uri, name: file.name, type: file.type },
          encounterId: ui.encounterId as string,
          testIds: matches[file.uri] ?? [],
        }))
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setDone(files.length);
    } catch (failure) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(failure instanceof Error ? failure.message : "Couldn't attach those files.");
    }
  }

  const sending = attach.isPending;

  return (
    <Sheet
      open={open}
      onClose={() => {
        if (!sending) closeCarePlanSheet();
      }}
      title={done ? 'Results attached' : 'Upload test results'}
      subtitle={
        done
          ? `${plural(done, 'file')} added to this consultation.`
          : 'Attach reports to the right tests in this consultation.'
      }
      footer={
        done ? (
          <View className="flex-row gap-2">
            <ActionButton
              size="md"
              label="Done"
              variant="outline"
              className="flex-1"
              onPress={closeCarePlanSheet}
            />
            <ActionButton
              size="md"
              label="View results"
              className="flex-[2]"
              onPress={() => ui.encounterId && openAttachedResults(ui.encounterId)}
            />
          </View>
        ) : (
          <View className="gap-2">
            {error ? <Text className="text-xs text-destructive">{error}</Text> : null}
            {files.length && unmatched ? (
              <Text className="text-xs text-muted-foreground">
                Pick at least one test for every file.
              </Text>
            ) : null}
            <View className="flex-row gap-2">
              <ActionButton
                size="md"
                label="Cancel"
                variant="outline"
                className="flex-1"
                disabled={sending}
                onPress={closeCarePlanSheet}
              />
              <ActionButton
                size="md"
                label={
                  sending
                    ? 'Uploading…'
                    : files.length
                      ? `Upload ${plural(files.length, 'file')}`
                      : 'Upload'
                }
                className="flex-[2]"
                disabled={!files.length || unmatched || sending}
                onPress={submit}
              />
            </View>
          </View>
        )
      }>
      {done ? (
        <View className="items-center py-6">
          <View className="size-20 items-center justify-center rounded-full bg-success/10">
            <Icon as={CircleCheck} className="size-10 text-success" />
          </View>
        </View>
      ) : (
        <>
          <View className="flex-row flex-wrap gap-2">
            <ActionButton
              label="Choose files"
              icon={Folder}
              variant="outline"
              onPress={chooseFiles}
            />
            <ActionButton
              label="Photo library"
              icon={ImageIcon}
              variant="outline"
              onPress={() => choosePhotos(false)}
            />
            <ActionButton
              label="Take a photo"
              icon={Camera}
              variant="outline"
              onPress={() => choosePhotos(true)}
            />
          </View>
          <Text className="text-xs leading-4.5 text-muted-foreground">
            {`PDF, JPG, PNG or HEIC · up to ${MAX_FILES} files · ${megabytes(MAX_FILE_BYTES)} each · ${megabytes(MAX_TOTAL_BYTES)} total`}
          </Text>

          {files.map((file) => (
            <View key={file.uri} className="gap-2.5 rounded-2xl bg-muted p-3.5">
              <View className="flex-row items-center gap-2.5">
                <Icon as={FileText} className="size-4 text-muted-foreground" />
                <View className="min-w-0 flex-1">
                  <Text className="text-[13px] font-semibold" numberOfLines={1}>
                    {file.name}
                  </Text>
                  {file.size ? (
                    <Text className="text-[11px] text-muted-foreground">
                      {kilobytes(file.size)}
                    </Text>
                  ) : null}
                </View>
                <ActionButton
                  icon={X}
                  variant="danger"
                  accessibilityLabel={`Remove ${file.name}`}
                  onPress={() => {
                    setError(null);
                    setFiles((current) => current.filter((item) => item.uri !== file.uri));
                  }}
                />
              </View>
              <Text className="text-[11px] font-semibold text-muted-foreground">
                This file covers
              </Text>
              {tests.map((test) => {
                const checked = (matches[file.uri] ?? []).includes(test.id);
                return (
                  <PressableScale
                    key={test.id}
                    scaleTo={0.98}
                    role="checkbox"
                    accessibilityState={{ checked }}
                    onPress={() => toggle(file.uri, test.id)}
                    className="flex-row items-center gap-3">
                    <CheckBox checked={checked} />
                    <Text className="flex-1 text-[13px]" numberOfLines={2}>
                      {test.name}
                    </Text>
                  </PressableScale>
                );
              })}
            </View>
          ))}
        </>
      )}
    </Sheet>
  );
}
