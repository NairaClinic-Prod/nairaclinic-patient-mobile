// Adds the Google Maps key from .env to the native iOS and Android config, so the map is Google Maps and not Apple Maps.
module.exports = ({ config }) => {
  const key = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';
  return {
    ...config,
    ios: { ...config.ios, config: { ...config.ios?.config, googleMapsApiKey: key } },
    android: {
      ...config.android,
      config: { ...config.android?.config, googleMaps: { apiKey: key } },
    },
  };
};
