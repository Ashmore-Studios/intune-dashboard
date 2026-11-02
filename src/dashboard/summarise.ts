export const STALE_MS = 90 * 24 * 60 * 60 * 1000;

export type FleetDevice = {
  id?: string;
  deviceName?: string;
  userPrincipalName?: string;
  operatingSystem?: string;
  osVersion?: string;
  lastSyncDateTime?: string;
  complianceState?: string;
  isEncrypted?: boolean | null;
};

export type AttentionDevice = {
  id: string;
  device: string;
  user: string;
  operatingSystem: string;
  compliance: string;
  lastCheckIn: string;
  reason: string;
  rank: number;
};

export type EncryptionSummary =
  | { status: "empty" }
  | { status: "unavailable" }
  | { status: "ok"; encrypted: number; notEncrypted: number; unknown: number };

export type FleetSummary = {
  total: number;
  platforms: { name: string; count: number }[];
  compliant: number;
  nonCompliant: number;
  complianceUnknown: number;
  inGracePeriod: number;
  win10: number;
  win11: number;
  stale: number;
  attention: number;
  windows: number;
  encryption: EncryptionSummary;
  attentionDevices: AttentionDevice[];
};

export function complianceLabel(state?: string): string {
  const value = (state || "").toLowerCase();
  if (!value) return "Unknown";
  const labels: Record<string, string> = {
    compliant: "Compliant",
    noncompliant: "Non-compliant",
    ingraceperiod: "In grace period",
    unknown: "Unknown",
    conflict: "Conflict",
    error: "Error",
    configmanager: "Config Manager",
  };
  return labels[value] || state || "Unknown";
}

export function formatCheckIn(iso?: string): string {
  if (!iso) return "Never";
  const time = Date.parse(iso);
  if (Number.isNaN(time)) return "Unknown";
  return new Date(time).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
}

function isStale(iso: string | undefined, now: number): boolean {
  if (!iso) return true;
  const time = Date.parse(iso);
  if (Number.isNaN(time)) return true;
  return now - time > STALE_MS;
}

export function summariseFleet(devices: FleetDevice[], now = Date.now()): FleetSummary {
  const platforms = new Map<string, number>();
  let compliant = 0;
  let nonCompliant = 0;
  let complianceUnknown = 0;
  let inGracePeriod = 0;
  let win10 = 0;
  let win11 = 0;
  let stale = 0;
  let windows = 0;
  let encrypted = 0;
  let notEncrypted = 0;
  let encryptionUnknown = 0;
  let sawEncryption = false;
  const attentionDevices: AttentionDevice[] = [];

  for (const device of devices) {
    const platform = device.operatingSystem || "Unknown";
    platforms.set(platform, (platforms.get(platform) || 0) + 1);
    const version = device.osVersion || "";
    const windowsDevice = platform.toLowerCase() === "windows";
    const isWin10 = version.startsWith("10.0.19");
    const isWin11 = version.startsWith("10.0.26");
    if (isWin10) win10 += 1;
    if (isWin11) win11 += 1;
    const staleDevice = isStale(device.lastSyncDateTime, now);
    if (staleDevice) stale += 1;

    const compliance = (device.complianceState || "").toLowerCase();
    if (compliance === "compliant") compliant += 1;
    else if (compliance === "noncompliant") nonCompliant += 1;
    else {
      complianceUnknown += 1;
      if (compliance === "ingraceperiod") inGracePeriod += 1;
    }

    if (windowsDevice) {
      windows += 1;
      if (device.isEncrypted === true) {
        sawEncryption = true;
        encrypted += 1;
      } else if (device.isEncrypted === false) {
        sawEncryption = true;
        notEncrypted += 1;
      } else {
        encryptionUnknown += 1;
      }
    }

    const reasons: string[] = [];
    let rank = 3;
    if (compliance === "noncompliant") {
      reasons.push("Non-compliant");
      rank = 0;
    }
    if (staleDevice) {
      reasons.push("Stale check-in");
      rank = Math.min(rank, 1);
    }
    if (isWin10) {
      reasons.push("Windows 10");
      rank = Math.min(rank, 2);
    }
    if (!reasons.length) continue;
    attentionDevices.push({
      id: device.id || `${device.deviceName || "device"}-${attentionDevices.length}`,
      device: device.deviceName || "Unnamed device",
      user: device.userPrincipalName || "—",
      operatingSystem: platform,
      compliance: complianceLabel(device.complianceState),
      lastCheckIn: formatCheckIn(device.lastSyncDateTime),
      reason: reasons.join(", "),
      rank,
    });
  }

  attentionDevices.sort((a, b) => a.rank - b.rank || a.device.localeCompare(b.device, "en-GB"));

  return {
    total: devices.length,
    platforms: [...platforms.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "en-GB")),
    compliant,
    nonCompliant,
    complianceUnknown,
    inGracePeriod,
    win10,
    win11,
    stale,
    attention: attentionDevices.length,
    windows,
    encryption: windows === 0
      ? { status: "empty" }
      : sawEncryption
        ? { status: "ok", encrypted, notEncrypted, unknown: encryptionUnknown }
        : { status: "unavailable" },
    attentionDevices,
  };
}
