// MSAL public-client config + sign-in scopes for THE Intune Dashboard.
// Loaded as a classic script before the main page script.
// Write scopes are requested just-in-time via ensureScopeToken() in the main script.

const MSAL_CONFIG = {
  auth: {
    clientId: '7cad0ab0-c576-4fa8-a367-e0d9e903f4c5',
    authority: 'https://login.microsoftonline.com/abfea98f-4f1c-4a5d-90c5-0eda4b7e0d59',
    redirectUri: window.location.origin + window.location.pathname
  },
  cache: { cacheLocation: 'sessionStorage' }
};

// Read-only scopes only — write scopes (DeviceManagementApps.ReadWrite.All,
// DeviceManagementScripts.ReadWrite.All, Mail.Send, …) are requested
// just-in-time via ensureScopeToken() the first time a write action runs,
// so read-only sessions never carry write permissions.
// Optional: Policy.Read.All is NOT listed here — Posture CA section requests
// it on demand (Grant button) so tenants that deny it still get Compliance.
const SCOPES = [
  'DeviceManagementManagedDevices.Read.All',
  'DeviceManagementApps.Read.All',
  'DeviceManagementScripts.Read.All',
  'DeviceManagementConfiguration.Read.All',
  'DeviceManagementServiceConfig.Read.All',
  'Group.Read.All',
  'User.Read',
  'User.Read.All',
  'AuditLog.Read.All',
  'ThreatHunting.Read.All',
  'BitlockerKey.ReadBasic.All',
  'Device.Read.All'
];
