import type { FleetSummary } from "./summarise";

export type SignedInAccount = {
  name: string;
  email: string;
  tenantId: string;
};

export type FailedAppRow = {
  name: string;
  publisher: string;
  failedDevices: number;
};

export type DriftRow = {
  name: string;
  driftPct: number;
  driftedDevices: number;
};

export type OverviewSnapshot = {
  refreshedAt: string;
  devices: { status: "ok"; summary: FleetSummary } | { status: "error"; message: string };
  failed:
    | { status: "ok"; apps: number; failedDeviceTotal: number; top: FailedAppRow[] }
    | { status: "error"; message: string };
  drift:
    | { status: "ok"; overTwenty: number; scanned: number; top: DriftRow[] }
    | { status: "unavailable"; message: string };
};

export type BraysApi = {
  switchTab: (tab: string) => void;
  switchSubtab: (name: string) => void;
  refresh: () => void;
  activeSubtab: () => string;
};
