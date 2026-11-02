import { Alert, AlertDescription, Button, useTheme } from "@ashmore-studios/ui";
import { ArrowRight, Moon, Sun } from "lucide-react";

const areas = [
  ["Devices", "Inventory, health and check-in"],
  ["Applications", "Installs, failures and versions"],
  ["Security", "Compliance, BitLocker and posture"],
  ["Reports", "The views already in this console"],
];

export function SignIn({ ready, error, onSignIn }: { ready: boolean; error: string; onSignIn: () => void }) {
  const { resolvedTheme, setTheme } = useTheme();
  const dark = resolvedTheme === "dark";

  return (
    <div className="grid h-svh bg-[#152033] lg:grid-cols-2">
      <section className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between">
        <Wave />
        <div className="relative z-10 flex items-center gap-3 px-12 pt-12 text-[#3d91f3]">
          <Mark />
          <span className="text-lg font-semibold tracking-tight">Brays Intune</span>
        </div>
        <div className="relative z-10 max-w-xl px-12">
          <p className="text-xs font-semibold tracking-[0.22em] text-[#3d91f3]">YOUR TENANT, CONNECTED</p>
          <h1 className="mt-5 font-serif text-5xl leading-[1.05] text-white xl:text-6xl">
            Built for the fleet.
            <span className="mt-1 block italic text-[#3d91f3]">Ready when you sign in.</span>
          </h1>
          <p className="mt-6 max-w-sm text-base text-white/80">One console for devices, applications and security.</p>
        </div>
        <div className="relative z-10 px-12 pb-12">
          <p className="text-xs font-semibold tracking-[0.18em] text-white/50">BRAYS INTUNE</p>
          <p className="mt-2 font-serif text-2xl text-white">Device, application and security reports in one place.</p>
        </div>
      </section>

      <section className={`relative flex min-h-0 flex-col ${dark ? "bg-[#1a2332] text-slate-100" : "bg-[#f6f5f2] text-slate-900"}`}>
        <div className="flex items-center justify-between px-6 pt-6 lg:justify-end">
          <div className={`flex items-center gap-2 lg:hidden ${dark ? "text-[#3d91f3]" : "text-[#1d4573]"}`}>
            <Mark />
            <span className="font-semibold">Brays Intune</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
            onClick={() => setTheme(dark ? "light" : "dark")}
          >
            {dark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
          </Button>
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-8">
          <h2 className="text-center font-serif text-4xl tracking-tight">Welcome back</h2>
          <p className={`mt-2 text-center text-sm ${dark ? "text-slate-400" : "text-slate-600"}`}>
            Sign in with your Microsoft Entra account.
          </p>

          {error ? (
            <Alert variant="destructive" className="mt-8">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <Button
            className="mt-8 h-12 w-full text-sm font-semibold tracking-wide"
            disabled={!ready}
            onClick={onSignIn}
          >
            <MicrosoftMark />
            {ready ? "Sign in with Microsoft" : "Preparing sign-in"}
            <ArrowRight className="ml-auto" aria-hidden="true" />
          </Button>
          <p className="mt-4 text-center text-xs leading-5 text-slate-500">
            Reports stay in this browser. The existing Entra application, redirect URI and delegated Graph permissions are unchanged.
          </p>
        </div>

        <div className={`mx-6 mb-6 border-t pt-5 sm:mx-10 ${dark ? "border-white/10" : "border-slate-200"}`}>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {areas.map(([title, detail]) => (
              <li key={title} className="min-w-0">
                <p className="text-sm font-semibold">{title}</p>
                <p className={`mt-1 text-xs leading-4 ${dark ? "text-slate-400" : "text-slate-500"}`}>{detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

function Mark() {
  return (
    <svg viewBox="0 0 32 32" className="size-8 shrink-0" aria-hidden="true">
      <rect width="32" height="32" rx="6" fill="currentColor" />
      <rect x="7" y="17" width="4" height="8" rx="1" fill="#fff" />
      <rect x="14" y="12" width="4" height="13" rx="1" fill="#fff" />
      <rect x="21" y="7" width="4" height="18" rx="1" fill="#fff" />
    </svg>
  );
}

function MicrosoftMark() {
  return (
    <svg viewBox="0 0 21 21" className="size-4" aria-hidden="true">
      <rect width="9" height="9" fill="#f25022" />
      <rect x="12" width="9" height="9" fill="#7fba00" />
      <rect y="12" width="9" height="9" fill="#00a4ef" />
      <rect x="12" y="12" width="9" height="9" fill="#ffb900" />
    </svg>
  );
}

function Wave() {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 800 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="signin-wave" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#8ebff8" stopOpacity="0" />
          <stop offset="0.35" stopColor="#3d91f3" stopOpacity="0.95" />
          <stop offset="1" stopColor="#00b8f0" stopOpacity="0.2" />
        </linearGradient>
        <filter id="signin-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      <rect width="800" height="1000" fill="#152033" />
      <g fill="none" stroke="url(#signin-wave)" filter="url(#signin-glow)">
        <path d="M-60 690 C 80 620, 160 760, 320 700 S 560 560, 880 640" strokeWidth="3" />
        <path d="M-60 730 C 100 660, 200 800, 360 740 S 600 600, 880 680" strokeWidth="1.5" opacity="0.7" />
        <path d="M-40 760 C 140 700, 240 840, 400 780 S 640 640, 900 720" strokeWidth="1" opacity="0.45" />
        <path d="M-80 820 C 60 760, 180 900, 340 840 S 620 700, 900 790" strokeWidth="2" opacity="0.55" />
      </g>
    </svg>
  );
}
