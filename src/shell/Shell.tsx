import { useEffect, useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  ScrollArea,
  SearchInput,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarItem,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  UserMenu,
  useTheme,
} from "@ashmore-studios/ui";
import { Menu, Moon, PanelLeft, RefreshCw, Sun } from "lucide-react";
import type { SignedInAccount } from "../dashboard/types";
import { applyLegacy, focusReportSearch, type PageId } from "../legacy/navigation";
import { findNavItem, navGroups, type NavItem } from "./nav";

const collapsedKey = "brays-sidebar-collapsed";

const searchable = new Set<PageId>([
  "local", "installed", "approvals", "failed", "required", "uninstall", "metering", "hardware",
  "diskspace", "appversions", "autopilot", "bitlocker", "secureboot", "certhealth", "assignments",
  "posture", "vulnerabilities", "drift", "softdeleted", "staleusers", "aiagents", "remediation", "analyze",
]);

const refreshable = new Set<PageId>([
  "dashboard", "installed", "approvals", "failed", "required", "uninstall", "metering", "hardware",
  "diskspace", "appversions", "autopilot", "bitlocker", "secureboot", "certhealth", "assignments",
  "posture", "vulnerabilities", "drift", "softdeleted", "staleusers", "aiagents", "remediation",
]);

function readCollapsed() {
  try {
    return localStorage.getItem(collapsedKey) === "1";
  } catch {
    return false;
  }
}

export function Shell({
  account,
  page,
  onNavigate,
  children,
}: {
  account: SignedInAccount;
  page: PageId;
  onNavigate: (id: PageId) => void;
  children: React.ReactNode;
}) {
  const { resolvedTheme, setTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState("");
  const current = findNavItem(page);

  useEffect(() => {
    setQuery("");
  }, [page]);

  useEffect(() => {
    const item = findNavItem(page);
    if (!item.anchor) return;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(item.anchor!)?.scrollIntoView({ block: "start" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [page]);

  useEffect(() => {
    const badge = document.getElementById("approvalsBadge");
    if (!badge) return;
    const read = () => {
      setPending(badge.style.display === "none" ? "" : (badge.textContent || "").trim());
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(badge, { attributes: true, childList: true, characterData: true, subtree: true });
    return () => observer.disconnect();
  }, [account.email]);

  function toggleCollapsed() {
    setCollapsed((value) => {
      const next = !value;
      try {
        localStorage.setItem(collapsedKey, next ? "1" : "0");
      } catch {
        /* preference stays for this visit */
      }
      return next;
    });
  }

  function open(item: NavItem) {
    setMobileOpen(false);
    onNavigate(item.id);
  }

  function refresh() {
    if (page === "dashboard") {
      applyLegacy("dashboard");
    }
    window.brays?.refresh();
  }

  const nav = (
    <NavList
      page={page}
      collapsed={collapsed}
      pending={pending}
      onOpen={open}
    />
  );

  return (
    <div className="flex h-svh w-full bg-background">
      <div
        className="hidden h-svh shrink-0 border-r border-sidebar-border md:flex"
        style={{ width: collapsed ? "4.5rem" : "16rem" }}
      >
        <Sidebar className="ops-nav" data-collapsed={collapsed ? "true" : "false"}>
          <SidebarHeader>
            <div className="flex items-center gap-2 px-1 py-1">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground" aria-hidden="true">B</span>
              <span className="ops-brand grid min-w-0 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Brays</span>
                <span className="truncate text-xs text-sidebar-foreground/70">Intune</span>
              </span>
            </div>
          </SidebarHeader>
          <SidebarContent>{nav}</SidebarContent>
        </Sidebar>
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b bg-sidebar px-3 py-2 sm:px-4">
          <div className="flex min-w-0 items-center gap-2">
            <Button className="md:hidden" variant="outline" size="icon" aria-label="Open navigation" onClick={() => setMobileOpen(true)}>
              <Menu aria-hidden="true" />
            </Button>
            <Button className="hidden md:inline-flex" variant="outline" size="icon" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} aria-expanded={!collapsed} onClick={toggleCollapsed}>
              <PanelLeft aria-hidden="true" />
            </Button>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden sm:inline-flex">Brays</BreadcrumbItem>
                <BreadcrumbSeparator className="hidden sm:inline-flex" />
                <BreadcrumbItem className="hidden md:inline-flex">{current.group}</BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:inline-flex" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{current.label}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex min-w-0 items-center gap-2">
            {searchable.has(page) && (
              <SearchInput
                className="hidden w-52 lg:flex"
                value={query}
                placeholder="Search this report"
                aria-label="Search this report"
                onChange={(event) => {
                  const value = event.target.value;
                  setQuery(value);
                  focusReportSearch(value);
                }}
              />
            )}
            {refreshable.has(page) && (
              <Button variant="outline" size="icon" aria-label="Refresh" onClick={refresh}>
                <RefreshCw aria-hidden="true" />
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              aria-label={resolvedTheme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            >
              {resolvedTheme === "dark" ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
            </Button>
            <div id="customer-slot" className="relative hidden sm:block" />
            <UserMenu
              className="h-auto max-w-56 justify-start gap-2 px-2"
              name={account.name}
              email={account.email}
              items={[{ id: "sign-out", label: "Sign out", destructive: true, onSelect: () => document.getElementById("btnSignOut")?.click() }]}
            />
          </div>
        </header>
        <main data-app-scroll-container className="min-h-0 flex-1 overflow-auto bg-background">
          {children}
        </main>
      </div>
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="border-b px-4 py-3">
            <SheetTitle>Brays Intune</SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(100svh-4rem)]">
            <NavList page={page} collapsed={false} pending={pending} onOpen={open} />
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function NavList({
  page,
  collapsed,
  pending,
  onOpen,
}: {
  page: PageId;
  collapsed: boolean;
  pending: string;
  onOpen: (item: NavItem) => void;
}) {
  return (
    <nav aria-label="Primary" className="flex flex-col">
      {navGroups.map((group) => (
        <SidebarGroup key={group.label} label={group.label}>
          {group.items.map((item) => {
            const label = item.id === "approvals" && pending ? `${item.label} (${pending})` : item.label;
            const button = (
              <SidebarItem
                label={label}
                active={page === item.id}
                icon={<item.icon aria-hidden="true" />}
                onSelect={() => onOpen(item)}
              />
            );
            if (!collapsed) return <span key={item.id}>{button}</span>;
            return (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <span>{button}</span>
                </TooltipTrigger>
                <TooltipContent side="right">{label}</TooltipContent>
              </Tooltip>
            );
          })}
        </SidebarGroup>
      ))}
    </nav>
  );
}
