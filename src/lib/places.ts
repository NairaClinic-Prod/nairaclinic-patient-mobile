import * as Location from 'expo-location';

const KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

export const HAS_PLACES_KEY = Boolean(KEY);

export type Point = { lat: number; lng: number };

export type PlaceFound = {
  address: string;
  state: string;
  lga: string;
  city: string;
  point: Point;
  placeId?: string;
};

export type PlaceHit = { id: string; main: string; secondary: string };

const tidy = (text: string) => text.replace(/,\s*Nigeria$/i, '').slice(0, 240);
const stateName = (text: string) => text.replace(/\s+State$/i, '').trim();

export class LocationBlockedError extends Error {}

export async function searchPlaces(query: string): Promise<PlaceHit[]> {
  if (!KEY) return [];
  const response = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': KEY },
    body: JSON.stringify({ input: query, includedRegionCodes: ['ng'], languageCode: 'en' }),
  });
  if (!response.ok) throw new Error('Address suggestions are not available right now.');
  const json = (await response.json()) as {
    suggestions?: {
      placePrediction?: {
        placeId: string;
        text?: { text: string };
        structuredFormat?: { mainText?: { text: string }; secondaryText?: { text: string } };
      };
    }[];
  };
  return (json.suggestions ?? []).flatMap((entry) => {
    const place = entry.placePrediction;
    if (!place) return [];
    return [
      {
        id: place.placeId,
        main: place.structuredFormat?.mainText?.text ?? place.text?.text ?? '',
        secondary: place.structuredFormat?.secondaryText?.text ?? '',
      },
    ];
  });
}

type Component = { longText?: string; types: string[] };

export async function placeDetails(id: string): Promise<PlaceFound> {
  const response = await fetch(
    `https://places.googleapis.com/v1/places/${encodeURIComponent(id)}`,
    {
      headers: {
        'X-Goog-Api-Key': KEY,
        'X-Goog-FieldMask': 'location,formattedAddress,addressComponents,displayName',
      },
    }
  );
  if (!response.ok) throw new Error('We could not load that address. Try another suggestion.');
  const json = (await response.json()) as {
    location?: { latitude: number; longitude: number };
    formattedAddress?: string;
    displayName?: { text: string };
    addressComponents?: Component[];
  };
  if (!json.location) throw new Error('We could not find that place on the map.');
  const part = (type: string) =>
    json.addressComponents?.find((entry) => entry.types.includes(type))?.longText ?? '';
  const name = json.displayName?.text ?? '';
  const formatted = json.formattedAddress ?? '';
  const address =
    name && formatted && !formatted.toLowerCase().startsWith(name.toLowerCase())
      ? `${name}, ${formatted}`
      : formatted || name;
  return {
    address: tidy(address),
    state: stateName(part('administrative_area_level_1')),
    lga: part('administrative_area_level_2'),
    city: part('locality') || part('sublocality'),
    point: { lat: json.location.latitude, lng: json.location.longitude },
    placeId: id,
  };
}

// Reverse geocoding uses the phone's own service, so a dropped pin still gets an address without any key.
export async function describePoint(point: Point): Promise<PlaceFound> {
  const [found] = await Location.reverseGeocodeAsync({ latitude: point.lat, longitude: point.lng });
  const street = [found?.streetNumber, found?.street ?? found?.name].filter(Boolean).join(' ');
  const area = found?.district ?? found?.city ?? '';
  const address = tidy(
    [street, area, found?.subregion, found?.region].filter(Boolean).join(', ') ||
      `Pinned location (${point.lat.toFixed(4)}, ${point.lng.toFixed(4)})`
  );
  return {
    address,
    state: stateName(found?.region ?? ''),
    lga: found?.subregion ?? '',
    city: found?.city ?? '',
    point,
  };
}

export async function locateMe(): Promise<PlaceFound> {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (permission.status !== 'granted') {
    throw new LocationBlockedError(
      'Location access is off. Turn it on in your phone settings, or type your street instead.'
    );
  }
  const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
  return describePoint({ lat: position.coords.latitude, lng: position.coords.longitude });
}
