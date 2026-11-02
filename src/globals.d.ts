import type { FleetDevice, FleetSummary } from "./dashboard/summarise";
import type { BraysApi, OverviewSnapshot } from "./dashboard/types";

declare global {
  interface Window {
    braysSummarise: (devices: FleetDevice[], now?: number) => FleetSummary;
    __overviewSnapshot?: OverviewSnapshot;
    brays?: BraysApi;
  }
}

export {};
