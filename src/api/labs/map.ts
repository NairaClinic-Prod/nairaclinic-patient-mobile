import type {
  BranchDetail,
  LabBranchSummary,
  LabBooking,
  LabCatalogueTest,
  LabOption,
  LabPackageDetail,
  LabPackageListItem,
  LabPackageSummary,
  LabPackageTest,
  PackageLabOption,
  PriceRequest,
  RawBooking,
  RawBranchDetail,
  RawBranchSummary,
  RawCatalogueTest,
  RawLabPackageDetail,
  RawLabPackageListItem,
  RawPackageLab,
  RawPackageTest,
  RawPackageView,
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

function toBranchSummary(raw: RawBranchSummary): LabBranchSummary {
  return {
    id: raw.id,
    labName: raw.labName,
    name: raw.name,
    area: raw.area,
    address: raw.address,
    phone: raw.phone,
    labVisits: raw.labVisits,
    homeCollection: raw.homeCollection,
    homeFeeKobo: raw.homeFeeKobo,
    homeAreas: raw.homeAreas ?? [],
    hours: raw.hours ?? [],
  };
}

function toPackageTest(raw: RawPackageTest): LabPackageTest {
  return {
    id: raw.id,
    name: raw.name,
    sample: raw.sample,
    description: raw.description ?? '',
    priceKobo: raw.priceKobo,
    shareKobo: raw.shareKobo,
    requiresPresence: raw.requiresPresence,
    kind: raw.kind,
    turnaroundHours: raw.turnaroundHours ?? null,
  };
}

export function toPackageSummary(raw: RawPackageView): LabPackageSummary {
  return {
    id: raw.id,
    branchId: raw.branchId,
    name: raw.name,
    description: raw.description ?? '',
    imageUrl: raw.imageUrl,
    priceKobo: raw.priceKobo,
    individualTotalKobo: raw.individualTotalKobo,
    savingsKobo: raw.savingsKobo,
    kind: raw.kind,
    bookable: raw.bookable,
    tests: raw.tests.map(toPackageTest),
  };
}

export function toLabPackageListItem(raw: RawLabPackageListItem): LabPackageListItem {
  return {
    ...toPackageSummary(raw),
    lab: raw.lab,
    distanceKm: raw.distanceKm,
    inArea: raw.inArea,
  };
}

export function toLabPackageDetail(raw: RawLabPackageDetail): LabPackageDetail {
  return { package: toPackageSummary(raw.package), branch: toBranchSummary(raw.branch) };
}

export function toBranchDetail(raw: RawBranchDetail): BranchDetail {
  return {
    branch: toBranchSummary(raw.branch),
    tests: raw.tests.map((test: RawCatalogueTest): LabCatalogueTest => ({
      id: test.id,
      name: test.name,
      category: test.category ?? '',
      sample: test.sample,
      priceKobo: test.priceKobo,
      turnaroundHours: test.turnaroundHours,
      requiresPresence: test.requiresPresence,
      kind: test.kind,
      description: test.description ?? '',
    })),
    packages: raw.packages.map(toPackageSummary),
  };
}

export function toPackageLabOption(raw: RawPackageLab): PackageLabOption {
  const branch = toBranchSummary(raw.branch);
  return {
    id: branch.id,
    labName: branch.labName,
    branchName: branch.name,
    area: branch.area,
    address: branch.address,
    labVisits: branch.labVisits,
    homeCollection: branch.homeCollection,
    homeFeeKobo: branch.homeFeeKobo,
    homeAreas: branch.homeAreas,
    hours: branch.hours,
    inArea: raw.inArea,
    distanceKm: raw.distanceKm,
    turnaroundHours: raw.turnaroundHours,
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
