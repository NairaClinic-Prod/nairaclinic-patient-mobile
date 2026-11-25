import type { BinaryReply } from '@/api/http';
import { createStore } from '@/lib/store';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

export type DocumentSection = { heading: string; lines: string[] };

// Which downloads are being prepared, so their buttons show "Preparing…" and ignore a second tap.
const pending = createStore<string[]>([]);
export const usePdfPending = (key: string) => pending.useSelect((list) => list.includes(key));

export async function runDocument(key: string, task: () => Promise<unknown>) {
  if (pending.get().includes(key)) return;
  pending.set((list) => [...list, key]);
  try {
    await task();
  } catch (error) {
    Alert.alert(
      "Couldn't open the file",
      error instanceof Error ? error.message : 'Please try again.'
    );
  } finally {
    pending.set((list) => list.filter((item) => item !== key));
  }
}

const safeName = (name: string) =>
  name
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100) || 'NairaClinic';

const TYPES: Record<string, { mime: string; uti: string; ext: string }> = {
  'application/pdf': { mime: 'application/pdf', uti: 'com.adobe.pdf', ext: 'pdf' },
  'image/jpeg': { mime: 'image/jpeg', uti: 'public.jpeg', ext: 'jpg' },
  'image/png': { mime: 'image/png', uti: 'public.png', ext: 'png' },
  'image/heic': { mime: 'image/heic', uti: 'public.heic', ext: 'heic' },
};

async function share(uri: string, type: string) {
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error("This phone can't open or share files from the app.");
  }
  const known = TYPES[type] ?? TYPES['application/pdf'];
  await Sharing.shareAsync(uri, { mimeType: known.mime, UTI: known.uti });
}

// Saves what the backend sent and opens the share sheet, where the patient can save, print or send it.
export async function openReply(reply: BinaryReply, fallbackName: string) {
  const type = reply.type.split(';')[0]?.trim().toLowerCase() ?? 'application/pdf';
  const ext = TYPES[type]?.ext ?? 'pdf';
  const base = safeName((reply.name ?? fallbackName).replace(/\.[a-z0-9]{2,4}$/i, ''));
  const file = new File(Paths.cache, `${base}.${ext}`);
  file.create({ overwrite: true });
  file.write(reply.bytes);
  await share(file.uri, type);
}
