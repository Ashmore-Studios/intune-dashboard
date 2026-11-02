import { useEffect, useState } from "react";
import { ErrorState, LoadingState } from "@ashmore-studios/ui";
import type { SignedInAccount } from "./dashboard/types";
import { bootLegacy } from "./legacy/boot";
import { applyLegacy, isPageId, pageFromLocation, type PageId } from "./legacy/navigation";
import { Dashboard } from "./pages/Dashboard";
import { Reports } from "./pages/Reports";
import { SettingsHome } from "./pages/SettingsHome";
import { SignIn } from "./pages/SignIn";
import { findNavItem } from "./shell/nav";
import { Shell } from "./shell/Shell";
import { LegacySlot } from "./shell/LegacySlot";

export function App() {
  const [booted, setBooted] = useState(false);
  const [bootError, setBootError] = useState("");
  const [msalReady, setMsalReady] = useState(false);
  const [account, setAccount] = useState<SignedInAccount | null>(null);
  const [error, setError] = useState("");
  const [page, setPage] = useState<PageId>(pageFromLocation);

  useEffect(() => {
    const host = document.getElementById("legacy-root");
    if (host) {
      bootLegacy(host).catch((reason: unknown) => {
        setBootError(reason instanceof Error ? reason.message : "The console could not be loaded.");
      });
    } else {
      setBootError("The reporting workspace is missing.");
    }

    const onMsal = () => setMsalReady(true);
    const onAuth = (event: Event) => {
      const detail = (event as CustomEvent<SignedInAccount | null>).detail;
      setAccount(detail);
      if (detail) setError("");
    };
    const onError = (event: Event) => {
      if (document.documentElement.classList.contains("locked")) {
        setError(String((event as CustomEvent).detail || "Sign-in failed."));
      }
    };
    const onNav = (event: Event) => {
      const next = (event as CustomEvent<{ page?: string }>).detail?.page;
      if (next && isPageId(next)) setPage(next);
    };
    const onPop = () => {
      const next = pageFromLocation();
      applyLegacy(next);
      setPage(next);
    };
    document.addEventListener("brays-msal", onMsal);
    document.addEventListener("brays-auth", onAuth);
    document.addEventListener("brays-error", onError);
    document.addEventListener("brays-nav", onNav);
    window.addEventListener("popstate", onPop);
    return () => {
      document.removeEventListener("brays-msal", onMsal);
      document.removeEventListener("brays-auth", onAuth);
      document.removeEventListener("brays-error", onError);
      document.removeEventListener("brays-nav", onNav);
      window.removeEventListener("popstate", onPop);
    };
  }, []);

  useEffect(() => {
    const onReady = () => setBooted(true);
    document.addEventListener("brays-ready", onReady);
    return () => document.removeEventListener("brays-ready", onReady);
  }, []);

  useEffect(() => {
    document.title = account ? `${findNavItem(page).label} · Brays Intune` : "Sign in · Brays Intune";
  }, [page, account]);

  function navigate(id: PageId) {
    const next = `#/${id}`;
    if (location.hash !== next) history.pushState(null, "", next);
    applyLegacy(id);
    setPage(id);
  }

  if (bootError) {
    return (
      <main className="grid min-h-svh place-items-center p-6">
        <ErrorState title="Console unavailable" message={bootError} />
      </main>
    );
  }
  if (!booted) {
    return (
      <main className="grid min-h-svh place-items-center p-6">
        <LoadingState label="Loading the console" />
      </main>
    );
  }
  if (!account) {
    return <SignIn ready={msalReady} error={error} onSignIn={() => document.getElementById("btnSignIn")?.click()} />;
  }

  return (
    <Shell account={account} page={page} onNavigate={navigate}>
      {page === "dashboard" && <Dashboard onOpen={navigate} />}
      {page === "reports" && <Reports onOpen={navigate} />}
      {page.startsWith("settings") && <SettingsHome account={account} />}
      <LegacySlot hidden={page === "dashboard" || page === "reports"} />
    </Shell>
  );
}
