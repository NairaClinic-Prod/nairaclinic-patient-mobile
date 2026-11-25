import {
  markMedicines,
  recordsApi,
  recordsKeys,
  useExtractPrescription,
  useSaveExternalRecord,
  type ExternalNext,
  type ExternalRecord,
  type NewExternalRecord,
} from '@/api/records';
import { queryClient } from '@/api/query-client';
import { ActionButton } from '@/components/shared/action-button';
import { CheckBox } from '@/components/shared/check-box';
import { OptionList } from '@/components/shared/option-list';
import { PressableScale } from '@/components/shared/pressable-scale';
import { Sheet } from '@/components/shared/sheet';
import { TextField } from '@/components/shared/text-field';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { openMakeOrder } from '@/features/make-order/store';
import { fileProblem, pickDocuments, pickPhotos, type PickedFile } from '@/lib/pick-files';
import { cn } from '@/lib/utils';
import * as Haptics from 'expo-haptics';
import {
  Camera,
  Check,
  CircleCheck,
  FileText,
  Folder,
  Image as ImageIcon,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  TriangleAlert,
  Upload,
} from 'lucide-react-native';
import * as React from 'react';
import { ActivityIndicator, Image, View } from 'react-native';
import { buildEncounters } from '../build';
import {
  EXTERNAL_CONFIRM,
  EXTERNAL_NEXT,
  EXTERNAL_SUMMARY,
  IRREVERSIBLE_NOTE,
  SAMPLE_TYPES,
} from '../constants';
import {
  blankMedicine,
  blankTest,
  closeExternalRecord,
  getExternalForm,
  patchExternal,
  useExternalForm,
  type ScanNote,
} from '../external-store';
import { plural } from '../utils';

const AMBER = 'text-amber-500';

function Warn({ note, text }: { note?: ScanNote; text?: string }) {
  const lines = [...(note?.warnings ?? []), ...(text ? [text] : [])];
  if (!lines.length) return null;
  return (
    <View className="flex-row items-start gap-1.5">
      <Icon as={TriangleAlert} className={cn('mt-0.5 size-3.5', AMBER)} />
      <Text className={cn('flex-1 text-[11px] leading-4', AMBER)}>{lines.join(' ')}</Text>
    </View>
  );
}

function Check1({
  checked,
  onToggle,
  children,
}: {
  checked: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <PressableScale
      scaleTo={0.99}
      role="checkbox"
      accessibilityState={{ checked }}
      onPress={onToggle}
      className="flex-row items-start gap-3">
      <CheckBox checked={checked} />
      <Text className="flex-1 text-[13px] leading-5">{children}</Text>
    </PressableScale>
  );
}

// Adds a prescription or test request from another clinic: choose how, check the details, then say what to do next.
export function ExternalRecordSheet() {
  const form = useExternalForm();
  const extract = useExtractPrescription();
  const save = useSaveExternalRecord();
  const isTest = form.kind === 'test';
  const what = isTest ? 'test request' : 'prescription';
  const rows = isTest ? form.tests : form.medicines;
  const [picked, setPicked] = React.useState<number | null>(null);
  const [problem, setProblem] = React.useState<string | null>(null);
  const [have, setHave] = React.useState<number[]>([]);
  const [saveError, setSaveError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!form.open) return;
    setPicked(null);
    setProblem(null);
    setHave([]);
    setSaveError(null);
  }, [form.open]);

  // Cleans and reads a picked file, then fills the form from what it found.
  async function read(file: PickedFile, append: boolean) {
    const wrong = fileProblem(file);
    if (wrong) {
      setProblem(wrong);
      return;
    }
    setProblem(null);
    const now = getExternalForm();
    patchExternal({
      method: 'upload',
      step: 'review',
      extracting: true,
      extractError: null,
      ...(append ? {} : { previewUri: file.uri, previewType: file.type }),
    });
    try {
      const result = await extract.mutateAsync({
        file: { uri: file.uri, name: file.name, type: file.type },
        kind: now.kind,
      });
      const current = getExternalForm();
      const noteFor = (index: number, asWritten?: string): ScanNote => ({
        warnings: (result.warnings ?? [])
          .filter((warning) => warning.item === index)
          .map((warning) => warning.message),
        asWritten: asWritten ?? '',
      });
      const fileWarnings = (result.warnings ?? [])
        .filter((warning) => warning.item === null)
        .map((warning) => warning.message);
      const common = {
        extracting: false,
        extractError: null,
        clinic: current.clinic || result.clinic || '',
        date: append ? current.date : result.date || current.date,
        sourceFiles: append
          ? [...current.sourceFiles, ...(result.sourceFile ? [result.sourceFile] : [])]
          : result.sourceFile
            ? [result.sourceFile]
            : [],
        scanWarnings: append ? [...current.scanWarnings, ...fileWarnings] : fileWarnings,
      };
      if (result.kind === 'medication') {
        const read = result.items.map((item, index) => ({
          ...blankMedicine(),
          name: item.name ?? '',
          dose: item.dose ?? '',
          frequency: item.frequency ?? '',
          route: item.route ?? '',
          durationDays: item.durationDays ?? null,
          startDate: item.startDate ?? '',
          scan: noteFor(index, item.asWritten),
        }));
        const kept = append ? current.medicines.filter((row) => row.name.trim()) : [];
        patchExternal({ ...common, medicines: [...kept, ...read] });
      } else {
        const read = result.items.map((item, index) => ({
          ...blankTest(),
          name: item.name ?? '',
          sample: item.sample || blankTest().sample,
          scan: noteFor(index, item.asWritten),
        }));
        const kept = append ? current.tests.filter((row) => row.name.trim()) : [];
        patchExternal({ ...common, tests: [...kept, ...read] });
      }
      setPicked(null);
    } catch (error) {
      patchExternal({
        extracting: false,
        extractError: error instanceof Error ? error.message : "We couldn't read this file.",
      });
    }
  }

  async function choose(source: 'files' | 'library' | 'camera', append = false) {
    const result =
      source === 'files'
        ? await pickDocuments(false)
        : await pickPhotos(source === 'camera', false, 1);
    if (result.error) setProblem(result.error);
    const file = result.files[0];
    if (file) await read(file, append);
  }

  const setMed = (index: number, patch: Partial<(typeof form.medicines)[number]>) =>
    patchExternal({
      medicines: form.medicines.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    });
  const setTest = (index: number, patch: Partial<(typeof form.tests)[number]>) =>
    patchExternal({
      tests: form.tests.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    });

  const removeRow = (index: number) => {
    setPicked(null);
    if (isTest) patchExternal({ tests: form.tests.filter((_, i) => i !== index) });
    else patchExternal({ medicines: form.medicines.filter((_, i) => i !== index) });
  };
  const addBlank = () => {
    setPicked(null);
    if (isTest) patchExternal({ tests: [...form.tests, blankTest()] });
    else patchExternal({ medicines: [...form.medicines, blankMedicine()] });
  };

  const extracted = form.method === 'upload';
  const openIndex = Math.min(picked ?? rows.length - 1, rows.length - 1);
  const openNameFilled = Boolean(rows[openIndex]?.name.trim());
  const valid =
    rows.length > 0 &&
    rows.every((row) => row.name.trim()) &&
    form.clinic.trim().length > 0 &&
    form.checked &&
    !form.extracting &&
    !form.extractError;

  async function submit() {
    setSaveError(null);
    const common = {
      clinic: form.clinic.trim(),
      date: form.date,
      next: form.next,
      ...(form.sourceFiles.length ? { sourceFiles: form.sourceFiles } : {}),
      ...(form.savedId ? { replaceId: form.savedId } : {}),
    };
    const strip = <T extends { scan?: unknown }>({ scan, ...rest }: T) => {
      void scan;
      return rest;
    };
    const record = (
      isTest
        ? { ...common, kind: 'test', items: form.tests.map(strip) }
        : {
            ...common,
            kind: 'medication',
            items: form.medicines.map((med) => ({
              ...strip(med),
              startDate: med.startDate || form.date,
            })),
          }
    ) as NewExternalRecord;

    let saved: ExternalRecord;
    try {
      saved = await save.mutateAsync(record);
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setSaveError(error instanceof Error ? error.message : "Couldn't save this record.");
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    patchExternal({ savedId: saved.id });

    // The care plan builds its entries from saved records, so use the same builder for the new one.
    const encounter = buildEncounters([], {}, new Set(), [saved])[0];
    if (form.next === 'order' && encounter) {
      if (!isTest) {
        const owned = encounter.medications
          .filter((_, index) => have.includes(index))
          .map((med) => med.id);
        if (owned.length) await markMedicines(owned, 'owned').catch(() => undefined);
        const toOrder = form.medicines
          .filter((_, index) => !have.includes(index))
          .map((med) => med.name)
          .filter(Boolean);
        if (!toOrder.length) {
          patchExternal({
            step: 'done',
            doneText: "Saved. You already have every medicine, so there's nothing to order.",
          });
          return;
        }
        await queryClient.refetchQueries({ queryKey: recordsKeys.carePlan });
        closeExternalRecord();
        setTimeout(
          () => openMakeOrder({ kind: 'medication', sourceId: saved.id, names: toOrder }),
          350
        );
        return;
      }
      await queryClient.refetchQueries({ queryKey: recordsKeys.carePlan });
      closeExternalRecord();
      setTimeout(() => openMakeOrder({ kind: 'lab', sourceId: saved.id }), 350);
      return;
    }
    patchExternal({
      step: 'done',
      doneText: isTest
        ? 'Test order saved. You can find it in Health records and To-do.'
        : 'Prescription saved. You can find it in Health records and To-do.',
    });
  }

  const eyebrow = isTest
    ? 'Add a test request from another clinic'
    : 'Add a prescription from another clinic';
  const options = EXTERNAL_NEXT[form.kind];
  const clinic = form.clinic.trim() || 'an external prescriber';

  const title =
    form.step === 'method' || form.step === 'upload'
      ? form.step === 'upload'
        ? `Upload your ${what}`
        : 'How would you like to add it?'
      : form.step === 'review'
        ? isTest
          ? 'Add the tests as requested.'
          : 'Add the medicines as prescribed.'
        : form.step === 'next'
          ? 'What would you like to do next?'
          : 'Saved';
  const subtitle =
    form.step === 'method'
      ? "Choose one way. We'll keep it with your health records and care checklist."
      : form.step === 'upload'
        ? "We'll read it for you, and you check the details before anything is saved."
        : form.step === 'review'
          ? `Copy the details from your ${what}. If anything is unclear, check with your prescriber or pharmacist.`
          : form.step === 'next'
            ? `${plural(rows.length, isTest ? 'test' : 'medicine')} from ${clinic}. Your ${isTest ? 'order' : 'prescription'} will be saved to Health records and To-do.`
            : undefined;

  const small = form.step === 'method' || form.step === 'upload' || form.step === 'done';

  let footer: React.ReactNode = undefined;
  if (form.step === 'review') {
    footer = (
      <View className="flex-row gap-2">
        <ActionButton
          size="md"
          label="Back"
          variant="outline"
          className="flex-1"
          onPress={() => patchExternal({ step: form.method === 'upload' ? 'upload' : 'method' })}
        />
        <ActionButton
          size="md"
          label="Continue"
          className="flex-[2]"
          disabled={!valid}
          onPress={() => patchExternal({ step: 'next' })}
        />
      </View>
    );
  } else if (form.step === 'next') {
    footer = (
      <View className="gap-2">
        {saveError ? <Text className="text-xs text-destructive">{saveError}</Text> : null}
        <View className="flex-row gap-2">
          <ActionButton
            size="md"
            label="Back"
            variant="outline"
            className="flex-1"
            disabled={save.isPending}
            onPress={() => patchExternal({ step: 'review' })}
          />
          <ActionButton
            size="md"
            label={
              save.isPending
                ? 'Saving…'
                : (options.find((o) => o.value === form.next)?.cta ?? 'Save')
            }
            className="flex-[2]"
            disabled={!form.declared || save.isPending}
            onPress={submit}
          />
        </View>
      </View>
    );
  } else if (form.step === 'done') {
    footer = <ActionButton size="md" label="Done" onPress={closeExternalRecord} />;
  }

  return (
    <Sheet
      open={form.open}
      onClose={() => {
        if (!save.isPending) closeExternalRecord();
      }}
      eyebrow={form.step === 'done' ? undefined : eyebrow}
      title={title}
      subtitle={subtitle}
      snapPoints={small ? undefined : ['92%']}
      footer={footer}>
      {form.step === 'method' ? (
        <OptionList
          options={[
            {
              key: 'upload',
              title: 'Take or upload a photo',
              description: 'Review the details before saving.',
              icon: Upload,
            },
            {
              key: 'type',
              title: isTest ? 'Type test details' : 'Type prescription details',
              description: 'No photo or file needed.',
              icon: FileText,
            },
          ]}
          onPick={(key) => {
            if (key === 'upload') patchExternal({ step: 'upload', method: 'upload' });
            else patchExternal({ step: 'review', method: 'type' });
          }}
        />
      ) : null}

      {form.step === 'upload' ? (
        <>
          <View className="flex-row flex-wrap gap-2">
            <ActionButton
              label="Choose a file"
              icon={Folder}
              variant="outline"
              onPress={() => choose('files')}
            />
            <ActionButton
              label="Photo library"
              icon={ImageIcon}
              variant="outline"
              onPress={() => choose('library')}
            />
            <ActionButton
              label="Take a photo"
              icon={Camera}
              variant="outline"
              onPress={() => choose('camera')}
            />
          </View>
          <Text className="text-xs leading-4.5 text-muted-foreground">
            PDF, JPG, PNG or HEIC, up to 10 MB.
          </Text>
          {problem ? <Text className="text-xs text-destructive">{problem}</Text> : null}
        </>
      ) : null}

      {form.step === 'review' ? (
        <>
          {form.extracting ? (
            <View className="flex-row items-center gap-2.5 rounded-2xl bg-muted p-3.5">
              <ActivityIndicator />
              <Text className="flex-1 text-xs leading-4.5 text-muted-foreground">
                {`Reading your ${what} carefully. This can take up to 2 minutes, so please keep this open.`}
              </Text>
            </View>
          ) : null}
          {form.extractError ? (
            <View className="gap-2 rounded-2xl bg-destructive/10 p-3.5">
              <Text className="text-[13px] font-bold text-destructive">
                We couldn't read this file
              </Text>
              <Text className="text-xs leading-4.5 text-destructive">{form.extractError}</Text>
              <ActionButton
                label="Try another file"
                variant="outline"
                className="self-start"
                onPress={() => patchExternal({ step: 'upload', extractError: null })}
              />
            </View>
          ) : null}
          {problem ? <Text className="text-xs text-destructive">{problem}</Text> : null}
          {form.previewUri && form.previewType?.startsWith('image/') ? (
            <Image
              source={{ uri: form.previewUri }}
              style={{ height: 150, borderRadius: 16 }}
              resizeMode="cover"
              accessibilityLabel="Your uploaded file"
            />
          ) : form.previewUri ? (
            <View className="flex-row items-center gap-2 rounded-2xl bg-muted p-3.5">
              <Icon as={FileText} className="size-4 text-muted-foreground" />
              <Text className="flex-1 text-[13px]">Your PDF was uploaded and is being read.</Text>
            </View>
          ) : null}
          {form.scanWarnings.map((line) => (
            <Warn key={line} text={line} />
          ))}

          <TextField
            sheet
            tone="muted"
            label={isTest ? 'Clinic / requester' : 'Clinic / prescriber'}
            required
            placeholder={isTest ? 'Who requested the tests' : "Hospital, clinic or doctor's name"}
            value={form.clinic}
            onChangeText={(clinicName) => patchExternal({ clinic: clinicName })}
            hint={
              extracted && !form.extracting && !form.clinic.trim()
                ? 'Empty. Please check.'
                : undefined
            }
          />

          {rows.map((row, index) => {
            const folded = index !== openIndex;
            const label = row.name || `${isTest ? 'Test' : 'Medicine'} ${index + 1}`;
            const note = row.scan;
            if (folded) {
              return (
                <View key={index} className="gap-2.5 rounded-2xl bg-muted p-3.5">
                  <Text className="text-[14px] font-bold" numberOfLines={2}>
                    {label}
                  </Text>
                  <Warn note={note} />
                  <View className="flex-row gap-2">
                    <ActionButton
                      label="Edit"
                      icon={Pencil}
                      variant="outline"
                      onPress={() => setPicked(index)}
                    />
                    {rows.length > 1 ? (
                      <ActionButton
                        label="Remove"
                        icon={Trash2}
                        variant="danger"
                        onPress={() => removeRow(index)}
                      />
                    ) : null}
                  </View>
                </View>
              );
            }
            return (
              <View key={index} className="gap-3 rounded-2xl bg-muted p-3.5">
                <Text className="text-[14px] font-bold">{`${isTest ? 'Test' : 'Medicine'} ${index + 1}`}</Text>
                <Warn note={note} />
                {isTest ? (
                  <>
                    <TextField
                      sheet
                      label="Test name"
                      required
                      value={form.tests[index]!.name}
                      onChangeText={(name) => setTest(index, { name })}
                      hint={
                        extracted && !form.extracting && !form.tests[index]!.name.trim()
                          ? 'Empty. Please check.'
                          : undefined
                      }
                    />
                    <Text className="text-xs font-semibold text-muted-foreground">Sample type</Text>
                    <View className="flex-row gap-2">
                      {SAMPLE_TYPES.map((type) => {
                        const selected = form.tests[index]!.sample === type;
                        return (
                          <PressableScale
                            key={type}
                            role="button"
                            accessibilityState={{ selected }}
                            onPress={() => setTest(index, { sample: type })}
                            className={cn(
                              'h-10 items-center justify-center rounded-full border px-4',
                              selected ? 'border-primary bg-secondary' : 'border-border bg-card'
                            )}>
                            <Text
                              className={cn(
                                'text-[13px] font-semibold',
                                selected ? 'text-primary' : 'text-muted-foreground'
                              )}>
                              {type}
                            </Text>
                          </PressableScale>
                        );
                      })}
                    </View>
                  </>
                ) : (
                  <>
                    <TextField
                      sheet
                      label="Medicine name & strength"
                      required
                      placeholder="Copy the medicine and strength as written"
                      value={form.medicines[index]!.name}
                      onChangeText={(name) => setMed(index, { name })}
                      hint={
                        extracted && !form.extracting && !form.medicines[index]!.name.trim()
                          ? 'Empty. Please check.'
                          : undefined
                      }
                    />
                    <TextField
                      sheet
                      label="Dose"
                      placeholder="As written on your prescription"
                      value={form.medicines[index]!.dose}
                      onChangeText={(dose) => setMed(index, { dose })}
                      hint={
                        extracted && !form.extracting && !form.medicines[index]!.dose.trim()
                          ? 'Empty. Please check.'
                          : undefined
                      }
                    />
                    <TextField
                      sheet
                      label="How often"
                      placeholder="As written on your prescription"
                      value={form.medicines[index]!.frequency}
                      onChangeText={(frequency) => setMed(index, { frequency })}
                      hint={
                        extracted && !form.extracting && !form.medicines[index]!.frequency.trim()
                          ? 'Empty. Please check.'
                          : undefined
                      }
                    />
                    <TextField
                      sheet
                      label="Route, e.g. IV, IM, oral (optional)"
                      placeholder="As prescribed"
                      value={form.medicines[index]!.route}
                      onChangeText={(route) =>
                        setMed(index, { route: route.replace(/[^\p{L}\s/-]/gu, '') })
                      }
                    />
                    <TextField
                      sheet
                      label="Duration in days"
                      keyboardType="number-pad"
                      maxLength={3}
                      value={
                        form.medicines[index]!.durationDays
                          ? String(form.medicines[index]!.durationDays)
                          : ''
                      }
                      onChangeText={(text) => {
                        const days = Number(text.replace(/\D/g, ''));
                        setMed(index, { durationDays: days ? Math.min(365, days) : null });
                      }}
                      hint={
                        extracted && !form.extracting && !form.medicines[index]!.durationDays
                          ? 'Empty. Please check.'
                          : undefined
                      }
                    />
                  </>
                )}
                {rows.length > 1 ? (
                  <ActionButton
                    label="Remove"
                    icon={Trash2}
                    variant="danger"
                    className="self-start"
                    onPress={() => removeRow(index)}
                  />
                ) : null}
              </View>
            );
          })}

          <View className="flex-row flex-wrap items-center gap-2">
            <ActionButton
              label={
                extracted ? `Upload another ${what}` : `Add another ${isTest ? 'test' : 'medicine'}`
              }
              icon={extracted ? Upload : Plus}
              variant="outline"
              disabled={form.extracting || !openNameFilled}
              onPress={() => (extracted ? choose('files', true) : addBlank())}
            />
            {extracted ? (
              <ActionButton
                label="or type one in"
                variant="ghost"
                disabled={!openNameFilled}
                onPress={addBlank}
              />
            ) : null}
          </View>
          {!openNameFilled && !form.extracting ? (
            <Text className="text-xs text-muted-foreground">
              {`Fill in this ${isTest ? 'test' : 'medicine'} name first to add another.`}
            </Text>
          ) : null}

          <Check1 checked={form.checked} onToggle={() => patchExternal({ checked: !form.checked })}>
            {EXTERNAL_CONFIRM[form.kind]}
          </Check1>
        </>
      ) : null}

      {form.step === 'next' ? (
        <>
          <View className="overflow-hidden rounded-2xl bg-muted">
            {options.map((option, index) => {
              const selected = form.next === option.value;
              return (
                <PressableScale
                  key={option.value}
                  scaleTo={0.99}
                  role="radio"
                  accessibilityState={{ checked: selected }}
                  onPress={() => patchExternal({ next: option.value as ExternalNext })}
                  className={cn(
                    'flex-row items-start gap-3 px-3.5 py-3',
                    index > 0 && 'border-t border-border/70'
                  )}>
                  <View
                    className={cn(
                      'mt-0.5 size-5 items-center justify-center rounded-full border-2',
                      selected ? 'border-primary' : 'border-muted-foreground/40'
                    )}>
                    {selected ? <View className="size-2.5 rounded-full bg-primary" /> : null}
                  </View>
                  <View className="min-w-0 flex-1">
                    <Text className="text-[14px] leading-5 font-semibold">{option.title}</Text>
                    <Text className="text-xs leading-4 text-muted-foreground">
                      {option.description}
                    </Text>
                  </View>
                </PressableScale>
              );
            })}
          </View>

          {form.next === 'order' && !isTest && rows.length ? (
            <View className="gap-2.5">
              <Text className="text-[13px] font-semibold">
                {'Already have any of these? '}
                <Text className="text-[13px] font-normal text-muted-foreground">(optional)</Text>
              </Text>
              <Text className="text-xs text-muted-foreground">
                Tick medicines you already have. They won't be added to the order.
              </Text>
              {rows.map((row, index) => (
                <Check1
                  key={index}
                  checked={have.includes(index)}
                  onToggle={() =>
                    setHave((current) =>
                      current.includes(index)
                        ? current.filter((i) => i !== index)
                        : [...current, index]
                    )
                  }>
                  {row.name}
                </Check1>
              ))}
            </View>
          ) : null}

          <View className="gap-2 rounded-2xl bg-muted p-3.5">
            {rows.map((row, index) => (
              <View key={index} className="flex-row items-center gap-2">
                <Icon as={Check} className="size-3.5 text-success" />
                <Text className="flex-1 text-[13px]">{row.name}</Text>
              </View>
            ))}
            <Text className="text-xs text-muted-foreground">
              {EXTERNAL_SUMMARY[form.kind][form.next]}
            </Text>
          </View>

          <Check1
            checked={form.declared}
            onToggle={() => patchExternal({ declared: !form.declared })}>
            {`This is ${isTest ? 'an order' : 'a prescription'} issued to me, and I have checked the details. Orders are subject to ${isTest ? 'laboratory' : 'pharmacy'} verification.`}
          </Check1>
          {!isTest ? (
            <View className="flex-row gap-2.5 rounded-2xl bg-secondary/50 p-3.5">
              <Icon as={ShieldCheck} className="mt-0.5 size-4 text-primary" />
              <Text className="flex-1 text-xs leading-4.5 text-muted-foreground">
                {IRREVERSIBLE_NOTE}
              </Text>
            </View>
          ) : null}
        </>
      ) : null}

      {form.step === 'done' ? (
        <View className="items-center gap-3 py-4">
          <View className="size-20 items-center justify-center rounded-full bg-success/10">
            <Icon as={CircleCheck} className="size-10 text-success" />
          </View>
          <Text className="text-center text-sm leading-5 text-muted-foreground">
            {form.doneText}
          </Text>
        </View>
      ) : null}
    </Sheet>
  );
}
