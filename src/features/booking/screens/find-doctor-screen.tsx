import { useDoctor, useDoctorSearch } from '@/api/booking';
import { ApiError } from '@/api/client';
import { ActionButton } from '@/components/shared/action-button';
import { EmptyState } from '@/components/shared/empty-state';
import { SegmentedControl } from '@/components/shared/segmented-control';
import { SubScreen } from '@/components/shared/sub-screen';
import { TextField } from '@/components/shared/text-field';
import { Text } from '@/components/ui/text';
import { router } from 'expo-router';
import { CloudOff, SearchX } from 'lucide-react-native';
import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { DoctorCard } from '../components/doctor-card';
import { MIN_QUERY } from '../constants';
import { slugFromLink } from '../utils';
import type { DoctorSummary } from '../types';

type Mode = 'name' | 'link';

function Hint({ children }: { children: string }) {
  return (
    <Text className="px-6 py-10 text-center text-[13px] leading-5 text-muted-foreground">
      {children}
    </Text>
  );
}

export function FindDoctorScreen() {
  const [mode, setMode] = React.useState<Mode>('name');
  const [name, setName] = React.useState('');
  const [link, setLink] = React.useState('');

  const query = name.trim();
  const slug = slugFromLink(link);
  const [debounced, setDebounced] = React.useState('');
  React.useEffect(() => {
    const timer = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const searching = mode === 'name' && debounced.length >= MIN_QUERY;
  const search = useDoctorSearch(debounced, searching);
  const linked = useDoctor(mode === 'link' ? slug : null);

  const results: DoctorSummary[] =
    mode === 'name'
      ? (search.data?.doctors ?? []).flatMap((doctor) =>
          doctor.bookingSlug
            ? [
                {
                  slug: doctor.bookingSlug,
                  name: doctor.name,
                  specialty: doctor.specialty?.replace(/_/g, ' ') || 'General practice',
                  languages: doctor.languages,
                  isOnline: doctor.isOnline,
                },
              ]
            : []
        )
      : linked.data?.acceptingBookings
        ? [linked.data]
        : [];
  const idle = mode === 'name' ? query.length < MIN_QUERY : !link.trim();
  const loading =
    mode === 'name'
      ? query.length >= MIN_QUERY && (search.isFetching || debounced !== query)
      : Boolean(slug) && linked.isFetching;
  const failed =
    mode === 'name'
      ? search.isError
      : linked.isError && !(linked.error instanceof ApiError && linked.error.status === 404);
  const retry = () => (mode === 'name' ? search.refetch() : linked.refetch());

  const open = (target: string) => router.push(`/book/doctor/${target}`);

  return (
    <SubScreen
      title="Find a doctor"
      description="Search by name or paste their NairaClinic link, then tap their card to book.">
      <View className="gap-4">
        <SegmentedControl<Mode>
          value={mode}
          onChange={setMode}
          options={[
            { value: 'name', label: 'Name' },
            { value: 'link', label: 'Link' },
          ]}
        />
        {mode === 'name' ? (
          <TextField
            label="Doctor's name"
            autoFocus
            autoCorrect={false}
            returnKeyType="search"
            placeholder="e.g. Ada Okafor"
            maxLength={100}
            value={name}
            onChangeText={setName}
          />
        ) : (
          <TextField
            label="Doctor's link"
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            placeholder="nairaclinic.com/doctor/…"
            value={link}
            onChangeText={setLink}
          />
        )}

        {idle ? (
          <Hint>
            {mode === 'name'
              ? "Type a doctor's first, middle or last name. Add another name to narrow it down."
              : 'Paste the link a doctor shared with you.'}
          </Hint>
        ) : mode === 'link' && !slug ? (
          <Hint>That doesn't look like a doctor's link. It should contain /doctor/.</Hint>
        ) : loading ? (
          <View className="items-center py-10">
            <ActivityIndicator />
          </View>
        ) : failed ? (
          <View className="rounded-2xl bg-card">
            <EmptyState
              icon={CloudOff}
              title="Couldn't search"
              text="Check your connection and try again."
              action={<ActionButton size="md" label="Try again" onPress={retry} />}
            />
          </View>
        ) : results.length ? (
          <View className="gap-3">
            {results.map((doctor) => (
              <DoctorCard key={doctor.slug} doctor={doctor} onPress={() => open(doctor.slug)} />
            ))}
          </View>
        ) : (
          <View className="rounded-2xl bg-card">
            <EmptyState
              icon={SearchX}
              text={
                mode === 'name'
                  ? `No doctors named “${query}”. Check the spelling or try their link.`
                  : linked.data && !linked.data.acceptingBookings
                    ? "This doctor hasn't set up any times yet, so they can't be booked right now."
                    : "We couldn't find a doctor at that link."
              }
            />
          </View>
        )}
      </View>
    </SubScreen>
  );
}
