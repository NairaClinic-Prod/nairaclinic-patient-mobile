import { createStore } from '@/lib/store';
import { Platform } from 'react-native';
import { DUMMY_PROFILE } from '../dummy';
import type { ProfileData } from '../types';

const store = createStore(DUMMY_PROFILE);

export const useProfile = store.use;

export function saveProfile(profile: ProfileData) {
  store.set((state) => ({ ...state, profile }));
}

export function makeDefaultCard(id: string) {
  store.set((state) => ({
    ...state,
    cards: state.cards.map((card) => ({ ...card, isDefault: card.id === id })),
  }));
}

export function removeCard(id: string) {
  store.set((state) => {
    const cards = state.cards.filter((card) => card.id !== id);
    const hasDefault = cards.some((card) => card.isDefault);
    return {
      ...state,
      cards: cards.map((card, index) => ({ ...card, isDefault: hasDefault ? card.isDefault : index === 0 })),
    };
  });
}

export function addDevice() {
  store.set((state) => ({
    ...state,
    devices: [
      ...state.devices,
      {
        id: `dev-${Date.now()}`,
        deviceName: Platform.OS === 'ios' ? 'iPhone' : 'Android phone',
        createdAt: new Date().toISOString(),
        lastUsedAt: null,
      },
    ],
  }));
}

export function removeDevice(id: string) {
  store.set((state) => ({ ...state, devices: state.devices.filter((device) => device.id !== id) }));
}

export function isLocked(profile: ProfileData) {
  return {
    name: Boolean(profile.firstName.trim()),
    dob: Boolean(profile.dob),
    sex: ['male', 'female'].includes(profile.sexAtBirth.toLowerCase()),
  };
}

export function initialsOf(profile: ProfileData) {
  return (
    [profile.firstName, profile.lastName]
      .filter(Boolean)
      .map((value) => value[0])
      .join('')
      .toUpperCase() || 'NC'
  );
}
