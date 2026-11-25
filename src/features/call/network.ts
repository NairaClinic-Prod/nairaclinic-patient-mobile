import NetInfo, { useNetInfo } from '@react-native-community/netinfo';
import { NetworkStatus } from '@zoom/react-native-videosdk';
import * as React from 'react';

export type LinkQuality = 'good' | 'fair' | 'poor' | 'unknown';

export const qualityOf = (status: NetworkStatus): LinkQuality =>
  status === NetworkStatus.Bad
    ? 'poor'
    : status === NetworkStatus.Normal
      ? 'fair'
      : status === NetworkStatus.Good
        ? 'good'
        : 'unknown';

// How many bad readings in a row turn the camera off to protect the audio, and how many good ones
// bring it back. Turning off is quick and turning on is patient, so the picture never flickers.
export const POOR_BEFORE_AUDIO_ONLY = 2;
export const GOOD_BEFORE_VIDEO_BACK = 3;

// What the phone itself knows about its connection, before Zoom has measured anything.
export function useDeviceNetwork() {
  const info = useNetInfo();
  const generation =
    info.type === 'cellular' && info.details && 'cellularGeneration' in info.details
      ? info.details.cellularGeneration
      : null;
  return {
    online: info.isConnected !== false && info.isInternetReachable !== false,
    // 2G and 3G can carry a call, but not a sharp picture: start with a light stream.
    slow: generation === '2g' || generation === '3g',
    kind: info.type,
  };
}

// Calls `onBack` when the phone comes back online after being offline.
export function useOnReconnect(onBack: () => void) {
  const latest = React.useRef(onBack);
  latest.current = onBack;
  React.useEffect(() => {
    let wasOffline = false;
    return NetInfo.addEventListener((state) => {
      const offline = state.isConnected === false || state.isInternetReachable === false;
      if (wasOffline && !offline) latest.current();
      wasOffline = offline;
    });
  }, []);
}
