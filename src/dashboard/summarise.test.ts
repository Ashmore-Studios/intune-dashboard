import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { summariseFleet, type FleetDevice } from "./summarise.ts";

const now = Date.parse("2026-11-02T12:00:00Z");
const recent = "2026-11-01T12:00:00Z";
const old = "2026-01-01T12:00:00Z";

describe("summariseFleet", () => {
  it("keeps a failed device list distinct from a genuine empty tenant", () => {
    const empty = summariseFleet([], now);
    assert.equal(empty.total, 0);
    assert.equal(empty.attention, 0);
    assert.deepEqual(empty.encryption, { status: "empty" });
  });

  it("does not turn a missing compliance or encryption value into a zero problem", () => {
    const devices: FleetDevice[] = [
      {
        id: "11111111-2222-3333-4444-555555555555",
        deviceName: "ACME-WIN11-01",
        userPrincipalName: "alex@contoso.com",
        operatingSystem: "Windows",
        osVersion: "10.0.26100.1",
        lastSyncDateTime: recent,
      },
    ];
    const summary = summariseFleet(devices, now);
    assert.equal(summary.compliant, 0);
    assert.equal(summary.nonCompliant, 0);
    assert.equal(summary.complianceUnknown, 1);
    assert.equal(summary.attention, 0);
    assert.deepEqual(summary.encryption, { status: "unavailable" });
  });

  it("counts compliant, non-compliant, stale and Windows 10 devices once each", () => {
    const devices: FleetDevice[] = [
      {
        id: "a",
        deviceName: "ACME-OK",
        userPrincipalName: "alex@contoso.com",
        operatingSystem: "Windows",
        osVersion: "10.0.26100.1",
        lastSyncDateTime: recent,
        complianceState: "compliant",
        isEncrypted: true,
      },
      {
        id: "b",
        deviceName: "ACME-LATE",
        userPrincipalName: "jane@fabrikam.com",
        operatingSystem: "Windows",
        osVersion: "10.0.19045.1",
        lastSyncDateTime: old,
        complianceState: "noncompliant",
        isEncrypted: false,
      },
      {
        id: "c",
        deviceName: "ACME-GRACE",
        operatingSystem: "Windows",
        osVersion: "10.0.26100.1",
        lastSyncDateTime: recent,
        complianceState: "inGracePeriod",
        isEncrypted: true,
      },
    ];
    const summary = summariseFleet(devices, now);
    assert.equal(summary.total, 3);
    assert.equal(summary.compliant, 1);
    assert.equal(summary.nonCompliant, 1);
    assert.equal(summary.complianceUnknown, 1);
    assert.equal(summary.inGracePeriod, 1);
    assert.equal(summary.win10, 1);
    assert.equal(summary.stale, 1);
    assert.equal(summary.attention, 1);
    assert.equal(summary.attentionDevices[0]?.device, "ACME-LATE");
    assert.equal(summary.attentionDevices[0]?.reason, "Non-compliant, Stale check-in, Windows 10");
    assert.deepEqual(summary.encryption, { status: "ok", encrypted: 2, notEncrypted: 1, unknown: 0 });
    assert.deepEqual(summary.platforms, [{ name: "Windows", count: 3 }]);
  });
});
