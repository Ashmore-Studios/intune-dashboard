import {
  DescriptionItem,
  DescriptionList,
  Label,
  RadioGroup,
  RadioGroupItem,
  SettingsPage,
  SettingsSection,
  useTheme,
  type Theme,
} from "@ashmore-studios/ui";
import type { SignedInAccount } from "../dashboard/types";

export function SettingsHome({ account }: { account: SignedInAccount }) {
  const { theme, setTheme } = useTheme();
  return (
    <SettingsPage title="Settings" description="Preferences stay in this browser. Sign-in still uses the existing Entra application.">
      <div id="settings-theme">
        <SettingsSection title="Theme" description="The console follows the system theme until you choose light or dark.">
          <RadioGroup value={theme} onValueChange={(value) => setTheme(value as Theme)} aria-label="Theme">
            <div className="flex items-center gap-2">
              <RadioGroupItem value="system" id="theme-system" />
              <Label htmlFor="theme-system">Match system</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="light" id="theme-light" />
              <Label htmlFor="theme-light">Light</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="dark" id="theme-dark" />
              <Label htmlFor="theme-dark">Dark</Label>
            </div>
          </RadioGroup>
        </SettingsSection>
      </div>
      <div id="settings-auth">
        <SettingsSection title="Authentication Information" description="Delegated Microsoft Graph session. Access tokens are not shown.">
          <DescriptionList>
            <DescriptionItem label="Name">{account.name}</DescriptionItem>
            <DescriptionItem label="Account">{account.email || "—"}</DescriptionItem>
            <DescriptionItem label="Tenant">{account.tenantId || "—"}</DescriptionItem>
            <DescriptionItem label="Redirect URI">{window.location.origin + window.location.pathname}</DescriptionItem>
            <DescriptionItem label="Permissions">Read scopes are requested at sign-in. Write scopes are requested only when you use a write action.</DescriptionItem>
          </DescriptionList>
        </SettingsSection>
      </div>
    </SettingsPage>
  );
}
