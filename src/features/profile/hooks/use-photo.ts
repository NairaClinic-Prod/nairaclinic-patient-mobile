import { createStore } from '@/lib/store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as React from 'react';

const KEY = 'nairaclinic.profile-photo';

const store = createStore<{ ready: boolean; uri: string | null }>({ ready: false, uri: null });

let loading: Promise<void> | null = null;

function load() {
  loading ??= AsyncStorage.getItem(KEY)
    .then((uri) => store.set({ ready: true, uri }))
    .catch(() => store.set((state) => ({ ...state, ready: true })));
  return loading;
}

function save(uri: string | null) {
  store.set((state) => ({ ...state, uri }));
  (uri ? AsyncStorage.setItem(KEY, uri) : AsyncStorage.removeItem(KEY)).catch(() => {});
}

export function usePhoto() {
  const state = store.use();
  React.useEffect(() => {
    load();
  }, []);
  return state.uri;
}

export const removePhoto = () => save(null);

const OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.8,
};

export type PhotoSource = 'camera' | 'library';

// Returns an error message to show, or null when the photo was set or the user simply backed out.
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
  const uri = result.canceled ? null : (result.assets[0]?.uri ?? null);
  if (uri) save(uri);
  return null;
}
