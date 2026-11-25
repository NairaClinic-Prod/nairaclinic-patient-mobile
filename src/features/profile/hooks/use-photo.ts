import { homeApi, homeKeys, useHomeProfile, type HomeProfileResponse } from '@/api/home';
import { queryClient } from '@/api/query-client';
import { createStore } from '@/lib/store';
import * as ImagePicker from 'expo-image-picker';

// A picture that has been chosen but not saved yet, so it shows at once while it uploads.
const pending = createStore<{ uri: string | null }>({ uri: null });

// The saved picture comes from the server, so it is the same one on the website and every phone.
export function usePhoto() {
  const server = useHomeProfile().data?.patientProfile?.profilePhotoUrl ?? null;
  const local = pending.useSelect((state) => state.uri);
  return local ?? server;
}

function remember(url: string | null) {
  queryClient.setQueryData<HomeProfileResponse>(homeKeys.profile, (current) =>
    current
      ? {
          ...current,
          patientProfile: {
            firstName: null,
            lastName: null,
            ...current.patientProfile,
            profilePhotoUrl: url,
          },
        }
      : current
  );
}

export async function removePhoto(): Promise<string | null> {
  try {
    await homeApi.removePhoto();
    remember(null);
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : "We couldn't remove your photo. Try again.";
  }
}

const OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.8,
};

export type PhotoSource = 'camera' | 'library';

// Returns an error message to show, or null when the photo was saved or the user simply backed out.
export async function pickPhoto(source: PhotoSource): Promise<string | null> {
  const permission =
    source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    return source === 'camera'
      ? 'Camera access is off. Turn it on in your phone settings to take a photo.'
      : 'Photo access is off. Turn it on in your phone settings to choose a photo.';
  }
  const result =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync(OPTIONS)
      : await ImagePicker.launchImageLibraryAsync(OPTIONS);
  const asset = result.canceled ? null : (result.assets[0] ?? null);
  if (!asset) return null;

  pending.set({ uri: asset.uri });
  try {
    const saved = await homeApi.uploadPhoto({
      uri: asset.uri,
      name: asset.fileName ?? `profile-${Date.now()}.jpg`,
      type: asset.mimeType ?? 'image/jpeg',
    });
    remember(saved.profilePhotoUrl);
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : "We couldn't save your photo. Try again.";
  } finally {
    pending.set({ uri: null });
  }
}
