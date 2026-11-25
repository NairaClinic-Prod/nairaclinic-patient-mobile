import { createStore } from '@/lib/store';
import { Platform } from 'react-native';
import { DUMMY_DEVICES } from './dummy';

const store = createStore({ devices: DUMMY_DEVICES });

export const useDevices = store.use;

export function addDevice() {
  store.set((state) => ({
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
  store.set((state) => ({ devices: state.devices.filter((device) => device.id !== id) }));
}
