import { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DashboardPage,
  DataTable,
  EmptyState,
  ErrorState,
  LoadingState,
  MetricCard,
  StatusBadge,
  type DataTableColumnDef,
} from "@ashmore-studios/ui";
import { Alert, AlertDescription, AlertTitle } from "@ashmore-studios/ui";
import type { AttentionDevice, FleetSummary } from "../dashboard/summarise";
import type { FailedAppRow, OverviewSnapshot } from "../dashboard/types";
import type { PageId } from "../legacy/navigation";

const attentionColumns: DataTableColumnDef<AttentionDevice>[] = [
  {
    accessorKey: "device",
    header: "Device",
    cell: ({ row }) => {
      const href = deviceHref(row.original.id);
      return href ? (
        <a className="font-medium text-primary underline-offset-4 hover:underline" href={href} target="_blank" rel="noreferrer">
          {row.original.device}
        </a>
      ) : (
        row.original.device
      );
    },
  },
  { accessorKey: "user", header: "User" },
  { accessorKey: "operatingSystem", header: "Operating System" },
  {
    accessorKey: "compliance",
    header: "Compliance",
    cell: ({ getValue }) => {
      const value = String(getValue() ?? "Unknown");
      const variant = value === "Compliant" ? "success" : value === "Non-compliant" ? "danger" : "neutral";
      return <StatusBadge variant={variant}>{value}</StatusBadge>;
    },
  },
  { accessorKey: "lastCheckIn", header: "Last Check-in" },
  { accessorKey: "reason", header: "Needs Attention" },
];

const failedColumns: DataTableColumnDef<FailedAppRow>[] = [
  { accessorKey: "name", header: "Application" },
  { accessorKey: "publisher", header: "Publisher" },
  { accessorKey: "failedDevices", header: "Failed Devices" },
];

function deviceHref(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  return `https://intune.microsoft.com/#view/Microsoft_Intune_Devices/DeviceSettingsMenuBlade/~/overview/mdmDeviceId/${encodeURIComponent(id)}`;
}

function downloadAttention(rows: AttentionDevice[]) {
  const header = ["Device", "User", "Operating system", "Compliance", "Last check-in", "Needs attention"];
  const body = rows.map((row) => [row.device, row.user, row.operatingSystem, row.compliance, row.lastCheckIn, row.reason]);
  const csv = [header, ...body].map((line) => line.map(csvCell).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "attention-devices.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function csvCell(value: string) {
  let text = value ?? "";
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function unavailable(message: string) {
  return { value: "—", hint: message, tone: "default" as const };
}

export function Dashboard({ onOpen }: { onOpen: (id: PageId) => void }) {
  const [phase, setPhase] = useState<"loading" | "ready">(window.__overviewSnapshot ? "ready" : "loading");
  const [snapshot, setSnapshot] = useState<OverviewSnapshot | undefined>(window.__overviewSnapshot);

  useEffect(() => {
    const onStatus = (event: Event) => {
      const detail = (event as CustomEvent<string>).detail;
      if (detail === "loading") setPhase("loading");
      if (detail === "ready") {
        setSnapshot(window.__overviewSnapshot);
        setPhase("ready");
      }
    };
    document.addEventListener("brays-overview", onStatus);
    if (window.__overviewSnapshot) {
      setSnapshot(window.__overviewSnapshot);
      setPhase("ready");
    }
    return () => document.removeEventListener("brays-overview", onStatus);
  }, []);

  if (!snapshot) {
    return (
      <DashboardPage title="Dashboard" description="Loading the tenant summary from Microsoft Graph.">
        <LoadingState label="Loading managed devices and application reports" rows={6} />
      </DashboardPage>
    );
  }

  const devices = snapshot.devices.status === "ok" ? snapshot.devices.summary : null;
  const refreshed = new Date(snapshot.refreshedAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
  const complianceHint = devices
    ? devices.inGracePeriod > 0
      ? `${devices.complianceUnknown} unknown, including ${devices.inGracePeriod} in a grace period.`
      : `${devices.complianceUnknown} unknown, in conflict, in error, or not reported.`
    : snapshot.devices.status === "error" ? snapshot.devices.message : "";

  return (
    <DashboardPage
      title="Dashboard"
      description={phase === "loading" ? "Refreshing Microsoft Graph data." : `Last successful refresh ${refreshed}.`}
      actions={<Button variant="outline" onClick={() => onOpen("reports")}>All reports</Button>}
    >
      {snapshot.devices.status === "error" && (
        <Alert variant="destructive">
          <AlertTitle>Device inventory is unavailable</AlertTitle>
          <AlertDescription>{snapshot.devices.message}</AlertDescription>
        </Alert>
      )}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="md:col-span-2">
          <MetricCard
            label="Devices requiring attention"
            tone={devices ? (devices.attention > 0 ? "warning" : "success") : "default"}
            value={devices ? devices.attention.toLocaleString("en-GB") : "—"}
            hint={devices ? "Non-compliant, stale for 90 days, or Windows 10" : "Device list unavailable"}
            onClick={devices ? () => onOpen("hardware") : undefined}
          />
        </div>
        <MetricCard
          label="Managed devices"
          tone="default"
          value={devices ? devices.total.toLocaleString("en-GB") : "—"}
          hint={devices ? (devices.platforms.slice(0, 3).map((item) => `${item.name} ${item.count}`).join(" · ") || "No platform reported") : snapshot.devices.status === "error" ? snapshot.devices.message : "Device list unavailable"}
          onClick={devices ? () => onOpen("hardware") : undefined}
        />
        <MetricCard
          label="Compliant devices"
          tone={devices ? "success" : "default"}
          value={devices ? devices.compliant.toLocaleString("en-GB") : "—"}
          hint={devices ? complianceHint : "Compliance was not returned"}
          onClick={devices ? () => onOpen("posture") : undefined}
        />
        <MetricCard
          label="Non-compliant devices"
          tone={devices ? (devices.nonCompliant > 0 ? "destructive" : "success") : "default"}
          value={devices ? devices.nonCompliant.toLocaleString("en-GB") : "—"}
          hint={devices ? "Intune compliance state is non-compliant" : "Compliance was not returned"}
          onClick={devices ? () => onOpen("posture") : undefined}
        />
        <MetricCard
          label="Failed installations"
          tone={snapshot.failed.status === "ok" ? (snapshot.failed.apps > 0 ? "destructive" : "success") : "default"}
          value={snapshot.failed.status === "ok" ? snapshot.failed.apps.toLocaleString("en-GB") : "—"}
          hint={snapshot.failed.status === "ok" ? `${snapshot.failed.failedDeviceTotal.toLocaleString("en-GB")} failed device records` : snapshot.failed.message}
          onClick={snapshot.failed.status === "ok" ? () => onOpen("failed") : undefined}
        />
        <MetricCard
          label="Stale check-ins"
          tone={devices ? (devices.stale > 0 ? "warning" : "success") : "default"}
          value={devices ? devices.stale.toLocaleString("en-GB") : "—"}
          hint={devices ? "No check-in, or the last check-in was more than 90 days ago" : "Device list unavailable"}
          onClick={devices ? () => onOpen("hardware") : undefined}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Device compliance</CardTitle>
            <CardDescription>Compliant, non-compliant and unknown devices from the managed device list.</CardDescription>
          </CardHeader>
          <CardContent>
            {devices ? (
              <SplitBar
                parts={[
                  { label: "Compliant", count: devices.compliant, className: "bg-success" },
                  { label: "Non-compliant", count: devices.nonCompliant, className: "bg-destructive" },
                  { label: "Unknown", count: devices.complianceUnknown, className: "bg-muted-foreground" },
                ]}
              />
            ) : (
              <ErrorState title="Compliance unavailable" message={snapshot.devices.status === "error" ? snapshot.devices.message : "Device list unavailable."} />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Operating systems</CardTitle>
            <CardDescription>Devices grouped by the operating system reported to Intune.</CardDescription>
          </CardHeader>
          <CardContent>
            {devices ? <PlatformBars platforms={devices.platforms} total={devices.total} /> : <p className="text-sm text-muted-foreground">Operating system totals are unavailable.</p>}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Application deployment</CardTitle>
            <CardDescription>Applications with at least one failed device install. Update packages are excluded.</CardDescription>
          </CardHeader>
          <CardContent>
            {snapshot.failed.status === "error" ? (
              <ErrorState title="Install report unavailable" message={snapshot.failed.message} />
            ) : snapshot.failed.top.length === 0 ? (
              <EmptyState title="No failed installations" description="The install summary report returned no applications with a failed device count." />
            ) : (
              <DataTable columns={failedColumns} data={snapshot.failed.top} pageSize={5} density="compact" caption="Applications with the most failed devices" />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Security posture</CardTitle>
            <CardDescription>Only figures present on the device list are shown. Missing reports stay blank.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <SecurityLine
              label="Windows encrypted"
              value={encryptionValue(devices, "encrypted")}
              action="Open BitLocker"
              onOpen={() => onOpen("bitlocker")}
            />
            <SecurityLine
              label="Windows not encrypted"
              value={encryptionValue(devices, "notEncrypted")}
              action="Open BitLocker"
              onOpen={() => onOpen("bitlocker")}
            />
            <SecurityLine label="Secure Boot" value={unavailable("Attestation is loaded on the Secure Boot report.")} action="Open Secure Boot" onOpen={() => onOpen("secureboot")} />
            <SecurityLine
              label="Key escrow"
              value={unavailable("Recovery-key escrow is not included in the device list.")}
              action="Open BitLocker"
              onOpen={() => onOpen("bitlocker")}
            />
            <SecurityLine
              label="Version drift over 20%"
              value={snapshot.drift.status === "ok"
                ? { value: snapshot.drift.overTwenty.toLocaleString("en-GB"), hint: `${snapshot.drift.scanned.toLocaleString("en-GB")} components scanned.` }
                : unavailable(snapshot.drift.message)}
              action="Open Configuration Drift"
              onOpen={() => onOpen("drift")}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-start justify-between gap-3">
          <div>
            <CardTitle>Devices requiring attention</CardTitle>
            <CardDescription>Non-compliant devices, devices that have not checked in for 90 days, and Windows 10 devices.</CardDescription>
          </div>
          {devices && devices.attentionDevices.length > 0 && (
            <Button variant="outline" onClick={() => downloadAttention(devices.attentionDevices)}>Export CSV</Button>
          )}
        </CardHeader>
        <CardContent>
          {!devices ? (
            <ErrorState title="Device list unavailable" message={snapshot.devices.status === "error" ? snapshot.devices.message : "Device list unavailable."} />
          ) : devices.attentionDevices.length === 0 ? (
            <EmptyState title="Nothing needs attention" description="No managed device is non-compliant, stale, or still on Windows 10." />
          ) : (
            <DataTable columns={attentionColumns} data={devices.attentionDevices} pageSize={8} density="compact" caption="Devices requiring attention" />
          )}
        </CardContent>
      </Card>
    </DashboardPage>
  );
}

function encryptionValue(devices: FleetSummary | null, key: "encrypted" | "notEncrypted") {
  if (!devices) return unavailable("Device list unavailable.");
  if (devices.encryption.status === "empty") return { value: "0", hint: "No Windows devices in the managed list." };
  if (devices.encryption.status === "unavailable") return unavailable("Intune did not return isEncrypted for these Windows devices.");
  const count = key === "encrypted" ? devices.encryption.encrypted : devices.encryption.notEncrypted;
  return { value: count.toLocaleString("en-GB"), hint: `${devices.encryption.unknown.toLocaleString("en-GB")} Windows devices did not report encryption.` };
}

function SecurityLine({
  label,
  value,
  action,
  onOpen,
}: {
  label: string;
  value: { value: string; hint: string };
  action: string;
  onOpen: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b pb-3 last:border-b-0 last:pb-0">
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-2xl font-medium tabular-nums">{value.value}</div>
        <p className="text-xs text-muted-foreground">{value.hint}</p>
      </div>
      <Button variant="ghost" size="sm" onClick={onOpen}>{action}</Button>
    </div>
  );
}

function SplitBar({ parts }: { parts: { label: string; count: number; className: string }[] }) {
  const total = parts.reduce((sum, part) => sum + part.count, 0);
  if (!total) return <p className="text-sm text-muted-foreground">No devices in this snapshot.</p>;
  return (
    <div>
      <div className="flex h-2 overflow-hidden rounded bg-muted" role="img" aria-label={parts.map((part) => `${part.label} ${part.count}`).join(", ")}>
        {parts.map((part) => part.count > 0 ? <div key={part.label} className={part.className} style={{ width: `${(part.count / total) * 100}%` }} /> : null)}
      </div>
      <ul className="mt-3 grid gap-1 text-sm">
        {parts.map((part) => (
          <li key={part.label} className="flex justify-between gap-3">
            <span>{part.label}</span>
            <span className="tabular-nums">{part.count.toLocaleString("en-GB")}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PlatformBars({ platforms, total }: { platforms: { name: string; count: number }[]; total: number }) {
  if (!platforms.length) return <p className="text-sm text-muted-foreground">No operating system was reported.</p>;
  return (
    <ul className="grid gap-3">
      {platforms.map((platform, index) => (
        <li key={platform.name}>
          <div className="mb-1 flex justify-between gap-3 text-sm">
            <span>{platform.name}</span>
            <span className="tabular-nums">{platform.count.toLocaleString("en-GB")}</span>
          </div>
          <div className="h-2 overflow-hidden rounded bg-muted">
            <div className={`h-full ${index === 0 ? "bg-primary" : "bg-foreground/25"}`} style={{ width: `${total ? (platform.count / total) * 100 : 0}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
