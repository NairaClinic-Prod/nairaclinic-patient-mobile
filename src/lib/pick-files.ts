import type { UploadFile } from '@/api/records';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

export const FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/heic',
  'image/heif',
];
export const MAX_FILE_BYTES = 10 * 1024 * 1024;

export type PickedFile = UploadFile & { size: number };

export const megabytes = (bytes: number) => `${Math.round((bytes / 1024 / 1024) * 10) / 10} MB`;

export function guessType(name: string, type?: string | null) {
  if (type) return type === 'image/jpg' ? 'image/jpeg' : type;
  const ext = name.split('.').pop()?.toLowerCase();
  return ext === 'pdf'
    ? 'application/pdf'
    : ext === 'png'
      ? 'image/png'
      : ext === 'heic'
        ? 'image/heic'
        : 'image/jpeg';
}

export function fileProblem(file: PickedFile): string | null {
  if (!FILE_TYPES.includes(file.type)) return `${file.name} isn't a PDF, JPG, PNG or HEIC.`;
  if (file.size > MAX_FILE_BYTES) return `${file.name} is over ${megabytes(MAX_FILE_BYTES)}.`;
  return null;
}

export type PickResult = { files: PickedFile[]; error?: string };

export async function pickDocuments(multiple: boolean): Promise<PickResult> {
  const result = await DocumentPicker.getDocumentAsync({
    type: FILE_TYPES,
    multiple,
    copyToCacheDirectory: true,
  });
  if (result.canceled) return { files: [] };
  return {
    files: result.assets.map((asset) => ({
      uri: asset.uri,
      name: asset.name,
      type: guessType(asset.name, asset.mimeType),
      size: asset.size ?? 0,
    })),
  };
}

export async function pickPhotos(
  camera: boolean,
  multiple: boolean,
  limit = 5
): Promise<PickResult> {
  const permission = camera
    ? await ImagePicker.requestCameraPermissionsAsync()
    : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    return {
      files: [],
      error: camera
        ? 'Camera access is off. Turn it on in your phone settings to take a photo.'
        : 'Photo access is off. Turn it on in your phone settings to choose a photo.',
    };
  }
  const result = camera
    ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.85 })
    : await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: multiple,
        selectionLimit: limit,
        quality: 0.85,
      });
  if (result.canceled) return { files: [] };
  return {
    files: result.assets.map((asset, index) => {
      const name = asset.fileName ?? `Photo ${Date.now()}-${index + 1}.jpg`;
      return {
        uri: asset.uri,
        name,
        type: guessType(name, asset.mimeType),
        size: asset.fileSize ?? 0,
      };
    }),
  };
}
