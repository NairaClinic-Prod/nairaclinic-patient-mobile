import { ApiError } from '@/api/client';
import { BodyLayout } from '@/components/common/body-layout';
import { ActionButton } from '@/components/shared/action-button';
import { ChoiceChips } from '@/components/shared/choice-chips';
import { SubScreenHeader } from '@/components/shared/sub-screen-header';
import { TextField } from '@/components/shared/text-field';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as Haptics from 'expo-haptics';
import { Check } from 'lucide-react-native';
import * as React from 'react';
import { View } from 'react-native';
import {
  BLOOD_GROUPS,
  GENOTYPES,
  LOCKED_NOTE,
  DETAIL_COPY,
  SEX_OPTIONS,
  YES_NO,
} from '../constants';
import { ageOf, saveProfile, useProfile } from '../hooks/use-profile';
import type { ProfileData, ProfileDetailSection } from '../types';

type Message = { kind: 'success' | 'error'; text: string };

const DOB = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
const dobLabel = (dob: string) => (dob ? DOB.format(new Date(dob)) : '');

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ProfileForm({ section }: { section: ProfileDetailSection }) {
  const { profile: saved } = useProfile();
  const [draft, setDraft] = React.useState<ProfileData>(saved);
  const [touched, setTouched] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<Message | null>(null);
  const age = ageOf(saved.dob);
  const copy = DETAIL_COPY[section];

  // The server profile can land after the sheet opens; take it until the patient edits.
  React.useEffect(() => {
    if (!touched) setDraft(saved);
  }, [saved, touched]);

  const patch = (change: Partial<ProfileData>) => {
    setTouched(true);
    setMessage(null);
    setDraft((current) => ({ ...current, ...change }));
  };

  const missing = [
    ...(!draft.firstName.trim() ? ['First name'] : []),
    ...(!draft.lastName.trim() ? ['Last name'] : []),
    ...(draft.email.trim() && !EMAIL.test(draft.email.trim()) ? ['A valid email address'] : []),
  ];
  const changed = JSON.stringify(draft) !== JSON.stringify(saved);

  async function save() {
    setSaving(true);
    try {
      await saveProfile(draft);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setMessage({ kind: 'success', text: 'Your profile has been updated.' });
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setMessage({
        kind: 'error',
        text:
          error instanceof ApiError
            ? error.message
            : "Couldn't save your profile. Check your connection and try again.",
      });
    } finally {
      setSaving(false);
    }
  }

  const footer = (
    <View className="gap-2 rounded-3xl bg-card p-3">
      {missing.length ? (
        <Text
          role="status"
          className="text-xs text-destructive">{`Still needed: ${missing.join(', ')}`}</Text>
      ) : null}
      <View className="flex-row gap-2">
        <ActionButton
          size="md"
          label="Discard changes"
          variant="outline"
          className="flex-1"
          disabled={!changed || saving}
          onPress={() => {
            setDraft(saved);
            setTouched(false);
            setMessage(null);
          }}
        />
        <ActionButton
          size="md"
          label={saving ? 'Saving…' : 'Save changes'}
          className="flex-1"
          disabled={!changed || missing.length > 0 || saving}
          onPress={save}
        />
      </View>
    </View>
  );

  return (
    <BodyLayout scrollView fixedHeader className="gap-4 pt-2" footer={footer}>
      <SubScreenHeader title={copy.title} />
      <Text className="text-xs leading-4.5 text-muted-foreground">{copy.description}</Text>

      {message ? (
        <View
          role="status"
          className={cn(
            'flex-row items-center gap-2 rounded-2xl p-3',
            message.kind === 'success' ? 'bg-secondary' : 'bg-destructive/10'
          )}>
          <Icon
            as={Check}
            className={cn(
              'size-4',
              message.kind === 'success' ? 'text-success' : 'text-destructive'
            )}
          />
          <Text
            className={cn(
              'flex-1 text-xs font-medium',
              message.kind === 'success' ? 'text-success' : 'text-destructive'
            )}>
            {message.text}
          </Text>
        </View>
      ) : null}

      {section === 'personal' ? (
        <View className="gap-4">
          <TextField
            label="First name"
            required
            disabled
            value={draft.firstName}
            onChangeText={(firstName) => patch({ firstName })}
          />
          <TextField
            label="Last name"
            required
            disabled
            value={draft.lastName}
            onChangeText={(lastName) => patch({ lastName })}
          />
          <TextField
            label="Email address"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={draft.email}
            onChangeText={(email) => patch({ email })}
          />
          <TextField label="Phone number" disabled value={draft.phone} />
          <View className="flex-row gap-3">
            <View className="flex-[1.6]">
              <TextField label="Date of birth" disabled value={dobLabel(draft.dob)} />
            </View>
            <View className="flex-1">
              <TextField label="Age" disabled value={age === null ? '' : `${age} years`} />
            </View>
          </View>
          <ChoiceChips
            label="Sex at birth"
            options={SEX_OPTIONS}
            value={draft.sexAtBirth}
            disabled
            onChange={(sexAtBirth) => patch({ sexAtBirth })}
          />
          <Text className="text-xs leading-4.5 text-muted-foreground">{LOCKED_NOTE}</Text>
        </View>
      ) : null}

      {section === 'health' ? (
        <View className="gap-4">
          <ChoiceChips
            label="Blood group"
            options={BLOOD_GROUPS}
            value={draft.bloodGroup}
            onChange={(bloodGroup) => patch({ bloodGroup })}
          />
          <ChoiceChips
            label="Genotype"
            options={GENOTYPES}
            value={draft.genotype}
            onChange={(genotype) => patch({ genotype })}
          />
          <TextField
            label="Allergies"
            placeholder="e.g. Penicillin"
            value={draft.allergies}
            onChangeText={(allergies) => patch({ allergies })}
          />
          <TextField
            label="Current medicines"
            placeholder="List your current medicines"
            value={draft.currentMedications}
            onChangeText={(currentMedications) => patch({ currentMedications })}
          />
          <TextField
            label="Past conditions"
            placeholder="Separate conditions with commas"
            value={draft.pastConditions}
            onChangeText={(pastConditions) => patch({ pastConditions })}
          />
        </View>
      ) : null}

      {section === 'preferences' ? (
        <View className="gap-4">
          <TextField
            label="Preferred language"
            value={draft.language}
            onChangeText={(language) => patch({ language })}
          />
          <TextField
            label="Alternative language"
            value={draft.altLanguage}
            onChangeText={(altLanguage) => patch({ altLanguage })}
          />
          <ChoiceChips
            label="Smoking"
            options={YES_NO}
            value={draft.smokingStatus}
            onChange={(smokingStatus) => patch({ smokingStatus })}
          />
          <ChoiceChips
            label="Alcohol"
            options={YES_NO}
            value={draft.alcoholUse}
            onChange={(alcoholUse) => patch({ alcoholUse })}
          />
        </View>
      ) : null}
    </BodyLayout>
  );
}
