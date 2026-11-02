import { useEffect, useRef } from "react";
import { ReportTables } from "../legacy/ReportTables";

export function LegacySlot({ hidden }: { hidden: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = document.getElementById("legacy-root");
    if (node && ref.current && node.parentElement !== ref.current) {
      node.hidden = false;
      ref.current.appendChild(node);
    }
  }, []);
  return (
    <div ref={ref} hidden={hidden}>
      <ReportTables />
    </div>
  );
}
