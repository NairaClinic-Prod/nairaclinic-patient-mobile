import { BodyLayout } from '@/components/common/body-layout';
import { ActionButton } from '@/components/patterns/action-button';
import { ChoiceChips } from '@/components/patterns/choice-chips';
import { SubScreenHeader } from '@/components/patterns/sub-screen-header';
import { TextField } from '@/components/patterns/text-field';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { DateField } from '@/features/reminders/components/reminder-pickers';
import { cn } from '@/lib/utils';
import * as Haptics from 'expo-haptics';
import { Check } from 'lucide-react-native';
import * as React from 'react';
import { ScrollView, View } from 'react-native';
import {
  BLOOD_GROUPS,
  GENOTYPES,
  LOCKED_NOTE,
  SECTION_COPY,
  SEX_OPTIONS,
  YES_NO,
} from '../constants';
import { isLocked, saveProfile, useProfile } from '../hooks/use-profile';
import type { ProfileData } from '../types';

type FormSection = 'personal' | 'health' | 'preferences';
type Message = { kind: 'success' | 'error'; text: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ProfileForm({ section }: { section: FormSection }) {
  const { profile: saved } = useProfile();
  const [draft, setDraft] = React.useState<ProfileData>(saved);
  const [message, setMessage] = React.useState<Message | null>(null);
  const locked = isLocked(saved);
  const copy = SECTION_COPY[section];

  const patch = (change: Partial<ProfileData>) => {
    setMessage(null);
    setDraft((current) => ({ ...current, ...change }));
  };

  const missing = [
    ...(!draft.firstName.trim() ? ['First name'] : []),
    ...(!draft.lastName.trim() ? ['Last name'] : []),
    ...(draft.email.trim() && !EMAIL.test(draft.email.trim()) ? ['A valid email address'] : []),
  ];
  const changed = JSON.stringify(draft) !== JSON.stringify(saved);

  function save() {
    saveProfile(draft);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setMessage({ kind: 'success', text: 'Your profile has been updated.' });
  }

  return (
    <BodyLayout className="gap-4 pt-2">
      <SubScreenHeader title={copy.title} />
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="gap-4 pb-4">
        <Text className="text-muted-foreground text-xs leading-[18px]">{copy.description}</Text>

        {message ? (
          <View
            role="status"
            className={cn(
              'flex-row items-center gap-2 rounded-2xl p-3',
              message.kind === 'success' ? 'bg-secondary' : 'bg-destructive/10'
            )}>
            <Icon
              as={Check}
              className={cn('size-4', message.kind === 'success' ? 'text-success' : 'text-destructive')}
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
              disabled={locked.name}
              value={draft.firstName}
              onChangeText={(firstName) => patch({ firstName })}
            />
            <TextField
              label="Last name"
              required
              disabled={locked.name}
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
            {locked.dob ? (
              <TextField label="Date of birth" disabled value={draft.dob} />
            ) : (
              <View className="gap-1.5">
                <Text className="text-muted-foreground text-xs font-semibold">Date of birth</Text>
                <View className="bg-card rounded-2xl px-4 py-3">
                  <DateField label="Date of birth" value={draft.dob} onChange={(dob) => patch({ dob })} />
                </View>
              </View>
            )}
            <ChoiceChips
              label="Sex at birth"
              options={SEX_OPTIONS}
              value={draft.sexAtBirth}
              disabled={locked.sex}
              onChange={(sexAtBirth) => patch({ sexAtBirth })}
            />
            {locked.name || locked.dob || locked.sex ? (
              <Text className="text-muted-foreground text-xs leading-[18px]">{LOCKED_NOTE}</Text>
            ) : null}
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
      </ScrollView>

      <View className="bg-card gap-2 rounded-3xl p-3">
        {missing.length ? (
          <Text role="status" className="text-destructive text-xs">{`Still needed: ${missing.join(', ')}`}</Text>
        ) : null}
        <View className="flex-row gap-2">
          <ActionButton
            size="md"
            label="Discard changes"
            variant="outline"
            className="flex-1"
            disabled={!changed}
            onPress={() => {
              setDraft(saved);
              setMessage(null);
            }}
          />
          <ActionButton
            size="md"
            label="Save changes"
            className="flex-1"
            disabled={!changed || missing.length > 0}
            onPress={save}
          />
        </View>
      </View>
    </BodyLayout>
  );
}
