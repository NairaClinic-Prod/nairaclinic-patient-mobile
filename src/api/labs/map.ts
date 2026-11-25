import type {
  LabBooking,
  LabOption,
  PriceRequest,
  RawBooking,
  RawRequest,
  RawSearchResult,
} from './type';

export function toLabOption(raw: RawSearchResult): LabOption {
  const matched = raw.matched.map((entry) => ({
    requested: entry.requested,
    priceKobo: entry.test?.priceKobo ?? null,
    testId: entry.test?.id ?? null,
  }));
  const found = raw.matched.flatMap((entry) => (entry.test ? [entry.test] : []));
  return {
    id: raw.branch.id,
    labName: raw.branch.labName,
    branchName: raw.branch.name,
    address: raw.branch.address || raw.branch.area,
    distanceKm: raw.distanceKm,
    labVisits: raw.branch.labVisits,
    homeCollection: raw.branch.homeCollection,
    homeFeeKobo: raw.branch.homeFeeKobo,
    homeAreas: raw.branch.homeAreas ?? [],
    turnaroundHours: found.reduce((most, test) => Math.max(most, test.turnaroundHours), 0),
    matched,
    matchedCount: found.length,
    subtotalKobo: found.reduce((sum, test) => sum + test.priceKobo, 0),
  };
}

export function toBooking(raw: RawBooking): LabBooking {
  return {
    id: raw.id,
    reference: raw.reference,
    status: raw.status,
    labName: raw.lab.name,
    branchName: raw.lab.branchName,
    address: raw.lab.address,
    collection: raw.collection,
    slotStart: raw.slotStart,
    items: raw.items.map((item) => ({
      id: item.id,
      name: item.name,
      priceKobo: item.priceKobo,
      released: item.reportStatus === 'released',
    })),
    homeFeeKobo: raw.homeFeeKobo ?? 0,
    serviceFeeKobo: raw.serviceFeeKobo ?? 0,
    deliveryFeeKobo: raw.deliveryFeeKobo ?? 0,
    totalKobo: raw.totalKobo,
    paid: raw.paid,
    canCancel: raw.canCancel ?? false,
    resultDelivery: raw.resultDelivery ?? 'collection',
    deliveryStatus: raw.deliveryStatus ?? null,
    collector: raw.collector ?? null,
    cancelReason: raw.cancelReason ?? null,
    refundStatus: raw.refundStatus ?? null,
    results: (raw.results ?? []).map((result) => ({
      id: result.id,
      fileName: result.fileName,
      testNames: result.testNames,
      releasedAt: result.releasedAt,
      url: result.url,
    })),
  };
}

export function toPriceRequest(raw: RawRequest): PriceRequest {
  return {
    id: raw.id,
    reference: raw.reference,
    tests: raw.tests,
    area: raw.area,
    collection: raw.collection,
    status: raw.status,
    expiresAt: raw.expiresAt,
    replies: raw.responses.map((reply) => ({
      id: reply.id,
      branchId: reply.branchId,
      lab: `${reply.labName} · ${reply.branchName}`,
      note: [
        reply.turnaroundHours ? `Results in about ${reply.turnaroundHours} hours` : null,
        reply.message,
      ]
        .filter(Boolean)
        .join(' · '),
      totalKobo: reply.totalKobo,
      homeCollection: reply.homeCollection,
    })),
  };
}
