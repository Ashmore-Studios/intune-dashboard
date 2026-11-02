import { Alert, AlertDescription, Button, useTheme } from "@ashmore-studios/ui";
import { Moon, Sun } from "lucide-react";
import { Mark } from "../shell/Mark";

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
    <div className="grid h-svh bg-background lg:grid-cols-[1.1fr_0.9fr]">
      <section className="relative hidden flex-col bg-[#0b0d14] text-[#eef0f5] lg:flex">
        <div className="flex items-center gap-3 px-8 pt-8">
          <Mark />
          <span className="text-base font-medium">Brays Intune</span>
        </div>
        <div className="flex flex-1 flex-col justify-center px-8 pb-16">
          <div className="max-w-md">
            <h1 className="text-[40px] leading-[1.08] font-medium text-[#eef0f5]">
              Intune reports for this tenant
            </h1>
            <p className="mt-4 max-w-sm text-base leading-6 text-[#a3a9b8]">
              Devices, applications and security, read from Microsoft Graph
            </p>
          </div>
          <ul className="mt-10 grid max-w-lg grid-cols-2 gap-x-8 gap-y-4">
            {areas.map(([title, detail]) => (
              <li key={title} className="min-w-0">
                <p className="text-sm font-medium text-[#eef0f5]">{title}</p>
                <p className="mt-1 text-xs leading-4 text-[#7a8296]">{detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="relative flex min-h-0 flex-col bg-background text-foreground">
        <div className="flex items-center justify-between px-6 pt-6 lg:justify-end">
          <div className="flex items-center gap-2 lg:hidden">
            <Mark className="size-7" />
            <span className="font-medium">Brays Intune</span>
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

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-8 py-8">
          <h2 className="text-[32px] leading-tight font-medium">Sign in</h2>
          <p className="mt-2 text-sm text-muted-foreground">Use the Microsoft Entra account for this tenant</p>

          {error ? (
            <Alert variant="destructive" className="mt-8">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <Button className="mt-8 h-12 w-full text-sm font-medium" disabled={!ready} onClick={onSignIn}>
            <MicrosoftMark />
            {ready ? "Sign in with Microsoft" : "Preparing sign-in"}
          </Button>
          <p className="mt-4 text-xs leading-5 text-muted-foreground">
            Reports stay in this browser. Entra, the redirect URI and delegated Graph permissions are unchanged
          </p>
        </div>
      </section>
    </div>
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
