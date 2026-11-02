import type { LucideIcon } from "lucide-react";
import {
  AppWindow,
  Bot,
  Bug,
  ChartColumn,
  FileText,
  FolderSearch,
  Gauge,
  HardDrive,
  HeartPulse,
  KeyRound,
  Layers,
  Lock,
  Monitor,
  PackageX,
  Rocket,
  ScrollText,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Unplug,
  UserRoundX,
  Wrench,
} from "lucide-react";
import type { PageId } from "../legacy/navigation";

export type NavItem = {
  id: PageId;
  label: string;
  group: string;
  icon: LucideIcon;
  anchor?: string;
};

export const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "Overview",
    items: [
      { id: "dashboard", label: "Dashboard", group: "Overview", icon: ChartColumn },
      { id: "approvals", label: "Approvals", group: "Overview", icon: ShieldAlert },
    ],
  },
  {
    label: "Devices",
    items: [
      { id: "hardware", label: "Hardware", group: "Devices", icon: Monitor },
      { id: "diskspace", label: "Disk Space", group: "Devices", icon: HardDrive },
      { id: "certhealth", label: "Management Health", group: "Devices", icon: HeartPulse },
      { id: "autopilot", label: "Autopilot", group: "Devices", icon: Rocket },
    ],
  },
  {
    label: "Applications",
    items: [
      { id: "installed", label: "Installed Applications", group: "Applications", icon: AppWindow },
      { id: "failed", label: "Failed Installations", group: "Applications", icon: PackageX },
      { id: "required", label: "Required Installations", group: "Applications", icon: Layers },
      { id: "uninstall", label: "Required Uninstallations", group: "Applications", icon: Trash2 },
      { id: "appversions", label: "Application Versions", group: "Applications", icon: Layers },
      { id: "metering", label: "Software Metering", group: "Applications", icon: Gauge },
    ],
  },
  {
    label: "Security",
    items: [
      { id: "bitlocker", label: "BitLocker", group: "Security", icon: Lock },
      { id: "secureboot", label: "Secure Boot", group: "Security", icon: Shield },
      { id: "posture", label: "Security Posture", group: "Security", icon: ShieldCheck },
      { id: "vulnerabilities", label: "Vulnerabilities", group: "Security", icon: Bug },
      { id: "drift", label: "Configuration Drift", group: "Security", icon: ScrollText },
    ],
  },
  {
    label: "Management",
    items: [
      { id: "remediation", label: "Remediations", group: "Management", icon: Wrench },
      { id: "assignments", label: "Assignments", group: "Management", icon: Layers },
      { id: "staleusers", label: "Stale Users", group: "Management", icon: UserRoundX },
      { id: "softdeleted", label: "Soft-Deleted Devices", group: "Management", icon: Trash2 },
      { id: "aiagents", label: "AI Agents", group: "Management", icon: Bot },
    ],
  },
  {
    label: "Analytics",
    items: [
      { id: "reports", label: "Reports", group: "Analytics", icon: ChartColumn },
      { id: "analyze", label: "Log Analysis", group: "Analytics", icon: FileText },
      { id: "local", label: "Local Uninstall Audit", group: "Analytics", icon: FolderSearch },
    ],
  },
  {
    label: "Settings",
    items: [
      { id: "settings-preferences", label: "Application Preferences", group: "Settings", icon: Settings, anchor: "settings-preferences" },
      { id: "settings-theme", label: "Theme", group: "Settings", icon: Settings, anchor: "settings-theme" },
      { id: "settings-auth", label: "Authentication Information", group: "Settings", icon: KeyRound, anchor: "settings-auth" },
      { id: "settings-integrations", label: "Integrations", group: "Settings", icon: Unplug, anchor: "settings-integrations" },
    ],
  },
];

export const flatNav = navGroups.flatMap((group) => group.items);

export function findNavItem(id: PageId) {
  return flatNav.find((item) => item.id === id) ?? flatNav[0];
}
