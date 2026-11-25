import { askLabs, labsApi, toLabOption } from '@/api/labs';
import { PriceChangedError, createRequest, orderFromPharmacies, sendRequest } from '@/api/orders';
import { ActionButton } from '@/components/shared/action-button';
import { CheckBox } from '@/components/shared/check-box';
import { PressableScale } from '@/components/shared/pressable-scale';
import { Sheet } from '@/components/shared/sheet';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Lock } from 'lucide-react-native';
import { useCarePlan } from '@/features/care-plan/store';
import { useHomeProfile } from '@/api/home';
import { messageOf } from '@/features/orders/actions';
import { showRequest } from '@/features/orders/ui-store';
import { formatNaira } from '@/features/orders/utils';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as React from 'react';
import { Alert, Linking, View } from 'react-native';
import { areaOf, isLocationComplete, matchArea, toDeliveryLocation } from '../location';
import { toLegacyResults } from '../legacy';
import { labSources, medicationSources } from '../search';
import { closeMakeOrder, useMakeOrderRequest } from '../store';
import { ChooseStep } from '../steps/choose-step';
import { PickStep, pickNote } from '../steps/pick-step';
import { LabResults, PharmacyResults, labTotalKobo, type Selection } from '../steps/results-step';
import { LabCheckoutStep, useLabCheckout } from '../steps/lab-checkout';
import { SentStep } from '../steps/sent-step';
import { WhereStep } from '../steps/where-step';
import {
  EMPTY_LOCATION,
  type Collection,
  type LabResult,
  type LocationDraft,
  type OrderKind,
  type OrderSource,
  type PharmacyCombination,
  type PharmacyResult,
} from '../types';
import { StepTabs } from './step-tabs';

type Stage = 'type' | 'pick' | 'items' | 'where' | 'results' | 'checkout' | 'sent';
type SentMode = 'all' | 'ask' | 'order' | 'booked';

const STEP_LABELS: Record<OrderKind, string[]> = {
  medication: ['Choose medicines', 'Delivery', 'Compare'],
  lab: ['Choose tests', 'Collection', 'Compare'],
};

const STEP_OF: Record<Stage, number> = {
  type: 0,
  pick: 1,
  items: 1,
  where: 2,
  results: 3,
  checkout: 3,
  sent: 0,
};

function headingFor(kind: OrderKind | null, stage: Stage) {
  if (stage === 'type' || !kind) {
    return { eyebrow: 'Make an order', title: 'What would you like to order?', text: undefined };
  }
  if (stage === 'checkout') {
    return {
      eyebrow: 'Lab tests',
      title: 'Book your test.',
      text: 'Choose a time and how you want your results.',
    };
  }
  if (kind === 'medication') {
    if (stage === 'pick')
      return { eyebrow: 'Medicines', title: 'Choose a prescription.', text: undefined };
    if (stage === 'items')
      return { eyebrow: 'Medicines', title: 'Which medicines do you need?', text: undefined };
    if (stage === 'where') {
      return {
        eyebrow: 'Medicines',
        title: 'How should we get them to you?',
        text: 'Your address is shared only with the pharmacy you choose.',
      };
    }
    return { eyebrow: 'Medicines', title: 'Who has your medicines?', text: undefined };
  }
  if (stage === 'pick')
    return { eyebrow: 'Lab tests', title: 'Choose a test order.', text: undefined };
  if (stage === 'items')
    return { eyebrow: 'Lab tests', title: 'Which tests do you need?', text: undefined };
  if (stage === 'where') {
    return {
      eyebrow: 'Lab tests',
      title: 'How should we collect your sample?',
      text: 'Your address stays private until you book a home visit.',
    };
  }
  return { eyebrow: 'Lab tests', title: 'Who can do your tests?', text: undefined };
}

const TERMS_URL = 'https://nairaclinic.com/terms';

const referenceOf = (id: string) => `RQ-${id.slice(-6).toUpperCase()}`;

export function MakeOrderSheet() {
  const request = useMakeOrderRequest();
  const carePlan = useCarePlan(request.open);

  const [kind, setKind] = React.useState<OrderKind | null>(null);
  const [stage, setStage] = React.useState<Stage>('type');
  const [sourceId, setSourceId] = React.useState<string | null>(null);
  const [picked, setPicked] = React.useState<Record<string, number>>({});
  const [collection, setCollection] = React.useState<Collection>('delivery');
  const [location, setLocation] = React.useState<LocationDraft>(EMPTY_LOCATION);
  const [consent, setConsent] = React.useState(false);
  const [problem, setProblem] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [leaving, setLeaving] = React.useState(false);
  const [offers, setOffers] = React.useState<PharmacyResult[]>([]);
  const [combination, setCombination] = React.useState<PharmacyCombination | null>(null);
  const [labs, setLabs] = React.useState<LabResult[]>([]);
  const [selection, setSelection] = React.useState<Selection>(null);
  const [requestFrom, setRequestFrom] = React.useState<string | null>(null);
  const [labPicked, setLabPicked] = React.useState<string | null>(null);
  const [sendAll, setSendAll] = React.useState(false);
  const [requestId, setRequestId] = React.useState<string | null>(null);
  const [labChosen, setLabChosen] = React.useState<LabResult | null>(null);
  const profile = useHomeProfile();
  const checkout = useLabCheckout({
    lab: labChosen,
    collection: collection === 'home' ? 'home' : 'lab_visit',
    location,
  });
  const [sent, setSent] = React.useState<{
    mode: SentMode;
    name: string | null;
    reference: string;
    requestId?: string;
  } | null>(null);

  const sourcesFor = React.useCallback(
    (which: OrderKind) =>
      which === 'medication' ? medicationSources(carePlan) : labSources(carePlan),
    [carePlan]
  );

  const source: OrderSource | null =
    kind && sourceId ? (sourcesFor(kind).find((entry) => entry.id === sourceId) ?? null) : null;

  const chooseSource = React.useCallback((entry: OrderSource, names?: string[] | null) => {
    setSourceId(entry.id);
    setPicked(
      Object.fromEntries(
        entry.items.map((item) => [item.name, !names || names.includes(item.name) ? 1 : 0])
      )
    );
    setStage('items');
  }, []);

  React.useEffect(() => {
    if (request.open) return;
    setStage('type');
    setKind(null);
    setSourceId(null);
    setLeaving(false);
  }, [request.open]);

  React.useEffect(() => {
    if (!request.open) return;
    setStage('type');
    setKind(null);
    setSourceId(null);
    setPicked({});
    setLocation(EMPTY_LOCATION);
    setConsent(false);
    setProblem(null);
    setBusy(false);
    setSelection(null);
    setRequestFrom(null);
    setLabPicked(null);
    setSendAll(false);
    setSent(null);
    setRequestId(null);
    setLabChosen(null);
    if (request.kind) {
      setKind(request.kind);
      setCollection(request.kind === 'medication' ? 'delivery' : 'lab_visit');
      setStage('pick');
      const match = request.sourceId
        ? sourcesFor(request.kind).find((entry) => entry.id === request.sourceId)
        : undefined;
      if (match) chooseSource(match, request.names);
    }
    // Only a new request restarts the flow; edits to the care plan underneath must not.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request.nonce]);

  const wanted = source ? source.items.filter((item) => (picked[item.name] ?? 0) > 0) : [];
  const wantedItems = wanted.map((item) => ({ name: item.name, quantity: picked[item.name] ?? 1 }));

  const setPacks = (name: string, packs: number) =>
    setPicked((current) => ({ ...current, [name]: Math.max(0, Math.min(20, packs)) }));

  const lab = kind === 'lab';
  const withStreet = collection === 'delivery' || collection === 'home';
  const missing = [
    ...(!isLocationComplete(location)
      ? [
          location.address.trim().length >= 3
            ? 'Pick your address from the suggestions'
            : withStreet
              ? lab
                ? 'Collection address'
                : 'Delivery address'
              : 'Your location',
        ]
      : []),
    ...(!consent ? ['Your consent'] : []),
  ];

  // The small chooser slides away first, then the full-height sheet opens.
  function chooseKind(next: OrderKind) {
    setKind(next);
    setCollection(next === 'medication' ? 'delivery' : 'lab_visit');
    setLeaving(true);
    setTimeout(() => {
      setStage('pick');
      setLeaving(false);
    }, 300);
  }

  async function find() {
    if (missing.length) {
      setProblem(`Still needed: ${missing.join(', ')}.`);
      return;
    }
    setProblem(null);
    setBusy(true);
    try {
      if (lab) {
        const found = await labsApi.search({
          tests: wanted.map((item) => item.name),
          area: areaOf(location),
          collection: collection === 'home' ? 'home' : 'lab_visit',
          point: location.point,
        });
        setLabs(found.map(toLabOption));
      } else {
        if (!source) throw new Error('Choose a prescription first.');
        const { state, lga } = matchArea(location);
        const { raw } = await createRequest({
          ...(source.external
            ? { externalRecordId: source.id }
            : { prescriptionId: source.prescriptionId as string }),
          fulfilment: collection === 'pickup' ? 'pickup' : 'delivery',
          urgent: false,
          items: wantedItems,
          ...(lga || location.city ? { deliveryArea: lga || location.city } : {}),
          ...(state ? { state } : {}),
          deliveryLocation: toDeliveryLocation(location),
        });
        setRequestId(raw.id);
        // The newer way: show the suggested pharmacies in Orders, as the website does. Nothing more
        // is sent until the patient chooses a pharmacy or taps "Ask all pharmacies".
        if (raw.engine) {
          const id = raw.id;
          closeMakeOrder();
          router.navigate('/orders');
          setTimeout(() => showRequest(id), 350);
          return;
        }
        const legacy = toLegacyResults(raw);
        setOffers(legacy.offers);
        setCombination(legacy.combination);
      }
      setSelection(null);
      setRequestFrom(null);
      setLabPicked(null);
      setSendAll(false);
      setStage('results');
    } catch (error) {
      setProblem(messageOf(error, "We couldn't search just now. Please try again."));
    } finally {
      setBusy(false);
    }
  }

  function finish(mode: SentMode, name: string | null, reference: string, id?: string) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSent({ mode, name, reference, requestId: id });
    setStage('sent');
  }

  // Runs one server step from the results footer, and says plainly if it fails.
  async function act(title: string, run: () => Promise<void>) {
    setBusy(true);
    try {
      await run();
    } catch (error) {
      if (error instanceof PriceChangedError) {
        Alert.alert(
          'The price changed',
          `The new total is ${formatNaira(error.totalKobo)}. Check it and order again.`
        );
        find();
      } else Alert.alert(title, messageOf(error));
    } finally {
      setBusy(false);
    }
  }

  async function orderNow() {
    if (!requestId || !selection) return;
    const ids =
      selection === 'combo'
        ? (combination?.parts.map((part) => part.pharmacy.id) ?? [])
        : [selection];
    await act("Couldn't place the order", async () => {
      const outcome = await orderFromPharmacies({
        requestId,
        pharmacyIds: ids,
        expectedTotalKobo: selectedTotal,
      });
      if (!outcome.paid) {
        Alert.alert('Payment not confirmed', outcome.message);
        return;
      }
      finish(
        'order',
        selection === 'combo' ? 'The pharmacies' : (selectedOffer?.name ?? null),
        referenceOf(requestId),
        requestId
      );
    });
  }

  async function askOne() {
    if (!requestId || !requestFrom) return;
    await act("Couldn't ask the pharmacy", async () => {
      await sendRequest(requestId, { mode: 'selected', pharmacyIds: [requestFrom] });
      finish('ask', requestedOffer?.name ?? null, referenceOf(requestId), requestId);
    });
  }

  async function askEveryone() {
    if (lab) {
      await act("Couldn't send your request", async () => {
        const row = profile.data;
        await askLabs({
          area: areaOf(location),
          collection: collection === 'home' ? 'home' : 'lab_visit',
          tests: wanted.map((item) => item.name),
          ...(location.point ? { point: location.point } : {}),
          contactName:
            [row?.patientProfile?.firstName, row?.patientProfile?.lastName]
              .filter(Boolean)
              .join(' ') || 'Patient',
          contactPhone: row?.user.phone ?? '',
        });
        finish('all', null, '');
      });
      return;
    }
    if (!requestId) return;
    await act("Couldn't send your request", async () => {
      await sendRequest(requestId, { mode: 'broadcast' });
      finish('all', null, referenceOf(requestId), requestId);
    });
  }

  async function payLab() {
    await act("Couldn't place the booking", async () => {
      const result = await checkout.submit();
      if (!result.outcome.paid) {
        Alert.alert('Payment not confirmed', result.outcome.message);
        return;
      }
      finish('booked', labChosen?.labName ?? null, result.booking.reference);
    });
  }

  const selectedOffer = offers.find((offer) => offer.id === selection);
  const selectedTotal =
    selection === 'combo' ? (combination?.totalKobo ?? 0) : (selectedOffer?.totalKobo ?? 0);
  const requestedOffer = offers.find((offer) => offer.id === requestFrom);
  const chosenLab = labs.find((entry) => entry.id === labPicked);
  // The checkout lives in this sheet, but only exists once a laboratory is chosen.

  const copy = headingFor(kind, stage);
  const step = STEP_OF[stage];

  let footer: React.ReactNode;
  if (stage === 'items') {
    footer = (
      <View className="gap-3">
        {wanted.length === 0 ? (
          <Text className="text-xs text-destructive">
            {`Choose at least one ${lab ? 'test' : 'medicine'} to continue.`}
          </Text>
        ) : (
          <View className="flex-row items-center gap-2">
            <Icon as={Lock} className="size-3.5 text-muted-foreground" />
            <Text className="flex-1 text-xs leading-4.5 text-muted-foreground">
              {pickNote(kind ?? 'medication')}
            </Text>
          </View>
        )}
        <View className="flex-row gap-2">
          <ActionButton
            size="md"
            variant="outline"
            label="Back"
            className="flex-1"
            onPress={() => {
              setSourceId(null);
              setStage('pick');
            }}
          />
          <ActionButton
            size="md"
            label="Continue"
            className="flex-1"
            disabled={wanted.length === 0}
            onPress={() => setStage('where')}
          />
        </View>
      </View>
    );
  } else if (stage === 'where') {
    footer = (
      <View className="gap-3">
        <PressableScale
          scaleTo={0.99}
          role="checkbox"
          accessibilityState={{ checked: consent }}
          onPress={() => setConsent((current) => !current)}
          className="flex-row items-center gap-3">
          <CheckBox checked={consent} />
          <Text className="flex-1 text-[13px] leading-5 text-muted-foreground">
            {'I agree to the '}
            <Text
              className="text-[13px] font-semibold text-primary"
              onPress={() => Linking.openURL(TERMS_URL)}>
              terms and conditions
            </Text>
            .
          </Text>
        </PressableScale>
        {missing.length ? (
          <Text className="text-xs text-muted-foreground">{`Still needed: ${missing.join(', ')}.`}</Text>
        ) : null}
        <View className="flex-row gap-2">
          <ActionButton
            size="md"
            variant="outline"
            label="Back"
            className="flex-1"
            disabled={busy}
            onPress={() => setStage('items')}
          />
          <ActionButton
            size="md"
            label={
              busy
                ? lab
                  ? 'Finding laboratories…'
                  : 'Finding pharmacies…'
                : lab
                  ? 'Find laboratories'
                  : 'Find pharmacies'
            }
            className="flex-[1.4]"
            disabled={missing.length > 0 || busy}
            onPress={find}
          />
        </View>
      </View>
    );
  } else if (stage === 'results') {
    const hint = lab
      ? sendAll
        ? 'No payment now. Laboratories that do your tests reply with a price.'
        : labPicked
          ? 'Nothing is booked until the laboratory confirms.'
          : 'Tap a laboratory to choose it, or tick the box to ask them all.'
      : sendAll
        ? 'No payment now. The first pharmacy to accept sends its price.'
        : requestFrom
          ? 'No payment now. You pay only if you accept the pharmacy’s price.'
          : selection
            ? 'Nothing is booked until the pharmacy accepts. If it can’t, you get your money back.'
            : 'Tap a pharmacy to choose it, ask one for a price, or tick the box to ask them all.';

    let action: React.ReactNode = null;
    if (sendAll) {
      action = (
        <ActionButton
          size="md"
          label={lab ? 'Send to all laboratories' : 'Send to all nearby pharmacies'}
          className="flex-[1.4]"
          disabled={busy}
          onPress={askEveryone}
        />
      );
    } else if (lab && chosenLab) {
      action = (
        <ActionButton
          size="md"
          label="Choose a time"
          className="flex-[1.4]"
          onPress={() => {
            setLabChosen(chosenLab);
            setStage('checkout');
          }}
        />
      );
    } else if (!lab && requestedOffer) {
      action = (
        <ActionButton
          size="md"
          label={busy ? 'Sending…' : `Ask ${requestedOffer.name} for a price`}
          className="flex-[1.4]"
          disabled={busy}
          onPress={askOne}
        />
      );
    } else if (!lab && selection) {
      action = (
        <ActionButton
          size="md"
          label={
            busy
              ? 'Placing your order…'
              : selection === 'combo'
                ? `Order · ${formatNaira(selectedTotal)}`
                : `Pay ${formatNaira(selectedTotal)}`
          }
          className="flex-[1.4]"
          disabled={busy}
          onPress={orderNow}
        />
      );
    }

    footer = (
      <View className="gap-3">
        <Text className="text-xs leading-4.5 text-muted-foreground">{hint}</Text>
        <View className="flex-row gap-2">
          <ActionButton
            size="md"
            variant="outline"
            label="Back"
            className="flex-1"
            onPress={() => setStage('where')}
          />
          {action}
        </View>
      </View>
    );
  } else if (stage === 'checkout') {
    footer = (
      <View className="gap-3">
        {checkout.problems.length && checkout.priced ? (
          <Text className="text-xs text-muted-foreground">{`Still needed: ${checkout.problems.join(', ')}.`}</Text>
        ) : null}
        <View className="flex-row gap-2">
          <ActionButton
            size="md"
            variant="outline"
            label="Back"
            className="flex-1"
            disabled={checkout.busy}
            onPress={() => setStage('results')}
          />
          <ActionButton
            size="md"
            label={
              checkout.busy
                ? 'Booking…'
                : checkout.priced
                  ? `Pay ${formatNaira(checkout.priced.pricing.totalKobo)}`
                  : 'Pay'
            }
            className="flex-[1.4]"
            disabled={checkout.busy || checkout.problems.length > 0}
            onPress={payLab}
          />
        </View>
      </View>
    );
  } else if (stage === 'sent') {
    footer = (
      <View className="gap-2">
        <ActionButton size="md" label="Done" onPress={closeMakeOrder} />
      </View>
    );
  }

  const choosing = request.open && stage === 'type' && !leaving && !request.kind;

  // The sheet keeps the close handler it was opened with, so it must read the current state through a ref.
  const choosingNow = React.useRef(choosing);
  choosingNow.current = choosing;

  return (
    <>
      <Sheet
        open={choosing}
        onClose={() => {
          if (choosingNow.current) closeMakeOrder();
        }}
        showClose
        eyebrow={headingFor(null, 'type').eyebrow}
        title={headingFor(null, 'type').title}>
        <ChooseStep onChoose={chooseKind} />
      </Sheet>
      <Sheet
        open={request.open && stage !== 'type'}
        onClose={closeMakeOrder}
        hideFooterWithKeyboard
        showClose
        divided={Boolean(footer)}
        snapPoints={['94%']}
        eyebrow={stage === 'sent' ? undefined : copy.eyebrow}
        title={stage === 'sent' ? (lab ? 'Laboratory order' : 'Medicine order') : copy.title}
        subtitle={stage === 'sent' ? undefined : copy.text}
        footer={footer}>
        {kind && step > 0 ? <StepTabs labels={STEP_LABELS[kind]} step={step} /> : null}

        {kind && (stage === 'pick' || stage === 'items') ? (
          <PickStep
            kind={kind}
            sources={sourcesFor(kind)}
            source={stage === 'items' ? source : null}
            picked={picked}
            onPickSource={(entry) => chooseSource(entry)}
            onPacks={setPacks}
          />
        ) : null}

        {kind && stage === 'where' ? (
          <WhereStep
            kind={kind}
            collection={collection}
            location={location}
            problem={problem}
            onCollection={setCollection}
            onLocation={(next) => {
              setProblem(null);
              setLocation(next);
            }}
          />
        ) : null}

        {stage === 'results' && !lab ? (
          <PharmacyResults
            offers={offers}
            combination={combination}
            collection={collection}
            selection={selection}
            requestFrom={requestFrom}
            sendToAll={sendAll}
            onSelection={(next) => {
              setSelection(next);
              if (next) {
                setSendAll(false);
                setRequestFrom(null);
              }
            }}
            onRequestFrom={(next) => {
              setRequestFrom(next);
              if (next) {
                setSelection(null);
                setSendAll(false);
              }
            }}
            onSendToAll={(next) => {
              setSendAll(next);
              if (next) {
                setSelection(null);
                setRequestFrom(null);
              }
            }}
          />
        ) : null}

        {stage === 'results' && lab ? (
          <LabResults
            labs={labs}
            total={wanted.length}
            collection={collection}
            selected={labPicked}
            askAll={sendAll}
            onSelect={(next) => {
              setLabPicked(next);
              if (next) setSendAll(false);
            }}
            onAskAll={(next) => {
              setSendAll(next);
              if (next) setLabPicked(null);
            }}
          />
        ) : null}

        {stage === 'checkout' ? <LabCheckoutStep checkout={checkout} /> : null}

        {stage === 'sent' && kind && sent ? (
          <SentStep kind={kind} mode={sent.mode} name={sent.name} reference={sent.reference} />
        ) : null}
      </Sheet>
    </>
  );
}
