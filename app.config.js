const { withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

// react-native-maps 1.29 ships Google Maps as the 'Google' subspec of react-native-maps. Expo's own
// Podfile line still asks for an old pod name that no longer exists, which breaks `pod install`.
const withGoogleMapsPod = (config) =>
  withDangerousMod(config, [
    'ios',
    (current) => {
      const file = path.join(current.modRequest.platformProjectRoot, 'Podfile');
      const text = fs.readFileSync(file, 'utf8');
      fs.writeFileSync(file, text.replace(/pod 'react-native-google-maps'/g, "pod 'react-native-maps/Google'"));
      return current;
    },
  ]);

// Xcode 27 beta compiles `compiler(>=6.4)` but its SDK has no iOS 27.1 `axisBehavior` yet, which stops
// expo-dev-launcher from building. Skip that one line until the SDK catches up (safe to repeat).
const withDevLauncherFix = (config) =>
  withDangerousMod(config, [
    'ios',
    (current) => {
      const launcher = path.dirname(
        require.resolve('expo-dev-launcher/package.json', { paths: [current.modRequest.projectRoot] })
      );
      const file = path.join(launcher, 'ios/SwiftUI/Navigation/DevLauncherToolbar.swift');
      if (fs.existsSync(file)) {
        const text = fs.readFileSync(file, 'utf8');
        fs.writeFileSync(file, text.replace('compiler(>=6.4)', 'compiler(>=99.0)'));
      }
      return current;
    },
  ]);

// Adds the Google Maps key from .env to the native iOS and Android config, so the map is Google Maps and not Apple Maps.
module.exports = ({ config }) => {
  const key = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';
  return withDevLauncherFix(withGoogleMapsPod({
    ...config,
    ios: { ...config.ios, config: { ...config.ios?.config, googleMapsApiKey: key } },
    android: {
      ...config.android,
      config: { ...config.android?.config, googleMaps: { apiKey: key } },
    },
  }));
};
