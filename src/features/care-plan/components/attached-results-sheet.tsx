import { recordsApi, useDeleteResult } from '@/api/records';
import { Sheet } from '@/components/shared/sheet';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { openReply } from '@/lib/documents';
import { Download, FileText, Trash2 } from 'lucide-react-native';
import * as React from 'react';
import { Alert, View } from 'react-native';
import { useCarePlan } from '../store';
import { closeCarePlanSheet, useCarePlanUi } from '../ui-store';
import { formatDate } from '../utils';
import { PdfButton } from './pdf-button';
import { ActionButton } from '@/components/shared/action-button';

const kilobytes = (bytes: number) =>
  bytes >= 1024 * 1024
    ? `${Math.round((bytes / 1024 / 1024) * 10) / 10} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;

// The result files attached to one consultation. Each can be opened (saved or shared) or deleted.
export function AttachedResultsSheet() {
  const ui = useCarePlanUi();
  const { encounters, results } = useCarePlan();
  const remove = useDeleteResult();
  const encounter = encounters.find((item) => item.id === ui.encounterId);
  const files = results.filter((file) => file.encounterId === ui.encounterId);

  const [opening, setOpening] = React.useState<string | null>(null);

  async function open(id: string, name: string) {
    setOpening(id);
    try {
      await openReply(await recordsApi.resultFile(id), name);
    } catch (error) {
      Alert.alert(
        "Couldn't open the file",
        error instanceof Error ? error.message : 'Please try again.'
      );
    } finally {
      setOpening(null);
    }
  }

  function confirmDelete(id: string, name: string) {
    Alert.alert('Delete this file?', `${name} will be removed from your record.`, [
      { text: 'Keep it', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () =>
          remove
            .mutateAsync(id)
            .catch((error) =>
              Alert.alert(
                "Couldn't delete it",
                error instanceof Error ? error.message : 'Please try again.'
              )
            ),
      },
    ]);
  }

  return (
    <Sheet
      open={ui.sheet === 'attached'}
      onClose={closeCarePlanSheet}
      title="Attached results"
      subtitle={
        encounter ? `Files stored in your record for consultation #${encounter.ref}.` : undefined
      }>
      {files.length ? (
        files.map((file) => {
          const names = (encounter?.tests ?? [])
            .filter((test) => file.testIds.includes(test.id))
            .map((test) => test.name);
          return (
            <View key={file.id} className="gap-3 rounded-2xl bg-muted p-3.5">
              <View className="flex-row items-center gap-2.5">
                <Icon as={FileText} className="size-4 text-muted-foreground" />
                <View className="min-w-0 flex-1">
                  <Text className="text-[13px] font-semibold" numberOfLines={1}>
                    {file.name}
                  </Text>
                  <Text className="text-[11px] text-muted-foreground">
                    {`${kilobytes(file.size)} · Added ${formatDate(file.uploadedAt)}`}
                  </Text>
                </View>
              </View>
              {names.length ? (
                <Text className="text-xs leading-4.5 text-muted-foreground">{`Covers: ${names.join(', ')}`}</Text>
              ) : null}
              <View className="flex-row gap-2">
                <PdfButton
                  pdfKey={`result:${file.id}`}
                  label={opening === file.id ? 'Opening…' : 'Open'}
                  icon={Download}
                  variant="outline"
                  disabled={opening === file.id}
                  onPress={() => open(file.id, file.name)}
                />
                <ActionButton
                  label="Delete"
                  icon={Trash2}
                  variant="danger"
                  onPress={() => confirmDelete(file.id, file.name)}
                />
              </View>
            </View>
          );
        })
      ) : (
        <Text className="py-6 text-center text-sm text-muted-foreground">
          No result files attached yet.
        </Text>
      )}
    </Sheet>
  );
}
