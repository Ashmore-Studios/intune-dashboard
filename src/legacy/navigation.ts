export type PageId =
  | "dashboard"
  | "reports"
  | "local"
  | "analyze"
  | "settings"
  | "settings-theme"
  | "settings-auth"
  | "settings-preferences"
  | "settings-integrations"
  | "installed"
  | "approvals"
  | "failed"
  | "required"
  | "uninstall"
  | "metering"
  | "hardware"
  | "diskspace"
  | "appversions"
  | "autopilot"
  | "bitlocker"
  | "secureboot"
  | "certhealth"
  | "assignments"
  | "posture"
  | "vulnerabilities"
  | "drift"
  | "softdeleted"
  | "staleusers"
  | "aiagents"
  | "remediation";

const pages = new Set<string>([
  "dashboard", "reports", "local", "analyze", "settings", "settings-theme", "settings-auth",
  "settings-preferences", "settings-integrations", "installed", "approvals", "failed", "required",
  "uninstall", "metering", "hardware", "diskspace", "appversions", "autopilot", "bitlocker",
  "secureboot", "certhealth", "assignments", "posture", "vulnerabilities", "drift", "softdeleted",
  "staleusers", "aiagents", "remediation",
]);

export function isPageId(value: string): value is PageId {
  return pages.has(value);
}

export function pageFromLocation(): PageId {
  const hash = location.hash.replace(/^#\/?/, "");
  return isPageId(hash) ? hash : "dashboard";
}

export function applyLegacy(id: PageId) {
  const api = window.brays;
  if (!api) return;
  if (id === "local") {
    api.switchTab("local");
    return;
  }
  if (id === "analyze") {
    api.switchTab("analyze");
    return;
  }
  if (id === "reports") {
    api.switchTab("intune");
    return;
  }
  if (id === "dashboard") {
    api.switchTab("intune");
    api.switchSubtab("overview");
    return;
  }
  if (id.startsWith("settings")) {
    api.switchTab("settings");
    return;
  }
  api.switchTab("intune");
  api.switchSubtab(id);
}

export function focusReportSearch(query: string) {
  const root = document.getElementById("legacy-root");
  if (!root) return;
  const inputs = [...root.querySelectorAll("input.search")] as HTMLInputElement[];
  const visible = inputs.find((input) => input.offsetParent !== null);
  if (!visible) return;
  visible.value = query;
  visible.dispatchEvent(new Event("input", { bubbles: true }));
}
