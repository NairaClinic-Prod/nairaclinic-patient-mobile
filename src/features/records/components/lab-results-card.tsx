import { ActionButton } from '@/components/shared/action-button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useOrdersData } from '@/features/orders/hooks/use-orders';
import { formatDay } from '@/features/orders/utils';
import { ExternalLink, FileText } from 'lucide-react-native';
import { Linking, Pressable, View } from 'react-native';
import { LAB_RESULTS_SHOWN } from '../constants';

type LabResultsCardProps = { onViewAll?: () => void };

export function LabResultsCard({ onViewAll }: LabResultsCardProps) {
  const { labBookings } = useOrdersData();
  const results = labBookings
    .flatMap((booking) =>
      booking.results.map((result) => ({
        ...result,
        labName: booking.labName,
        reference: booking.reference,
      }))
    )
    .sort((a, b) => (b.releasedAt ?? '').localeCompare(a.releasedAt ?? ''));

  if (!results.length) return null;

  return (
    <View className="gap-3 rounded-2xl bg-card p-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-bold">Lab results</Text>
        <Pressable hitSlop={12} onPress={onViewAll} className="active:opacity-60">
          <Text className="text-xs font-semibold text-primary">All lab tests</Text>
        </Pressable>
      </View>
      <View className="gap-2">
        {results.slice(0, LAB_RESULTS_SHOWN).map((result) => (
          <View
            key={result.id}
            className="flex-row items-center gap-3 rounded-2xl border border-border p-3">
            <Icon as={FileText} className="size-4 text-muted-foreground" />
            <View className="min-w-0 flex-1">
              <Text className="text-[13px] font-semibold" numberOfLines={1}>
                {result.testNames.join(', ')}
              </Text>
              <Text className="text-[11px] text-muted-foreground" numberOfLines={1}>
                {`${result.labName} · ${result.reference}${
                  result.releasedAt ? ` · ${formatDay(result.releasedAt)}` : ''
                }`}
              </Text>
            </View>
            {result.url ? (
              <ActionButton
                label="Open"
                icon={ExternalLink}
                variant="ghost"
                onPress={() => Linking.openURL(result.url as string)}
              />
            ) : null}
          </View>
        ))}
      </View>
    </View>
  );
}
