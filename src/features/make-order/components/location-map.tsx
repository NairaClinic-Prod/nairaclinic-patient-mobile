import { Text } from '@/components/ui/text';
import { describePoint, type Point } from '@/lib/places';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as React from 'react';
import { Platform, View } from 'react-native';
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  type MapPressEvent,
  type MarkerDragStartEndEvent,
} from 'react-native-maps';
import type { LocationDraft } from '../types';

type LocationMapProps = { value: LocationDraft; onChange: (next: LocationDraft) => void };

const DELTA = 0.006;

// Google Maps everywhere except iOS inside Expo Go, which does not ship the Google Maps iOS SDK.
const PROVIDER =
  Platform.OS === 'ios' && Constants.executionEnvironment === ExecutionEnvironment.StoreClient
    ? undefined
    : PROVIDER_GOOGLE;

export function LocationMap({ value, onChange }: LocationMapProps) {
  const point = value.point;
  const map = React.useRef<MapView>(null);

  React.useEffect(() => {
    if (!point) return;
    map.current?.animateToRegion(
      { latitude: point.lat, longitude: point.lng, latitudeDelta: DELTA, longitudeDelta: DELTA },
      350
    );
  }, [point?.lat, point?.lng]);

  async function move(next: Point) {
    onChange({ ...value, point: next, typed: false });
    try {
      const found = await describePoint(next);
      onChange({
        ...value,
        address: found.address,
        state: found.state,
        lga: found.lga,
        city: found.city,
        point: next,
        typed: false,
      });
    } catch {
      onChange({ ...value, point: next, typed: false });
    }
  }

  if (!point) return null;

  return (
    <View className="gap-2">
      <View className="h-56 overflow-hidden rounded-2xl border border-border bg-muted">
        <MapView
          ref={map}
          provider={PROVIDER}
          style={{ flex: 1 }}
          initialRegion={{
            latitude: point.lat,
            longitude: point.lng,
            latitudeDelta: DELTA,
            longitudeDelta: DELTA,
          }}
          onPress={(event: MapPressEvent) =>
            move({
              lat: event.nativeEvent.coordinate.latitude,
              lng: event.nativeEvent.coordinate.longitude,
            })
          }>
          <Marker
            draggable
            coordinate={{ latitude: point.lat, longitude: point.lng }}
            onDragEnd={(event: MarkerDragStartEndEvent) =>
              move({
                lat: event.nativeEvent.coordinate.latitude,
                lng: event.nativeEvent.coordinate.longitude,
              })
            }
          />
        </MapView>
      </View>
      <Text className="text-xs text-muted-foreground">Drag the pin or tap the map to adjust.</Text>
    </View>
  );
}
