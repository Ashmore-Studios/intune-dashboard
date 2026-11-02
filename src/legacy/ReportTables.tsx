import { DataTable, type DataTableColumnDef } from "@ashmore-studios/ui";
import type { SortingState } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { createRoot, type Root } from "react-dom/client";

type CellSnap = { html: string; className: string };
type RowSnap = { sourceIndex: number; warn: boolean; cells: CellSnap[] };
type Snapshot = { titles: string[]; rows: RowSnap[]; empty: string; sorting: SortingState };

function readSorting(table: HTMLTableElement): SortingState {
  const cells = [...(table.tHead?.rows[0]?.cells ?? [])];
  const index = cells.findIndex((cell) => cell.classList.contains("sort-asc") || cell.classList.contains("sort-desc"));
  if (index < 0) return [];
  return [{ id: `c${index}`, desc: cells[index].classList.contains("sort-desc") }];
}

function signature(element: HTMLElement) {
  const data = [...element.attributes]
    .filter((attribute) => attribute.name.startsWith("data-") || attribute.name === "onclick")
    .map((attribute) => `${attribute.name}=${attribute.value}`)
    .join("|");
  return `${element.tagName}|${data}|${element.textContent || ""}`;
}

function readSnapshot(table: HTMLTableElement): Snapshot {
  const heads = [...(table.tHead?.rows[0]?.cells ?? [])];
  const titles = heads.map((cell, index) => cell.textContent?.replace(/\s+/g, " ").trim() || `Column ${index + 1}`);
  const bodyRows = [...(table.tBodies[0]?.rows ?? [])];
  const emptyRow = bodyRows.find((row) => row.cells.length === 1 && row.querySelector(".empty"));
  const rows = bodyRows
    .filter((row) => row !== emptyRow)
    .map((row) => ({
      sourceIndex: row.rowIndex,
      warn: row.classList.contains("warn-row"),
      cells: [...row.cells].map((cell) => ({ html: cell.innerHTML, className: cell.className })),
    }));
  return { titles, rows, empty: emptyRow?.textContent?.trim() || "No results", sorting: readSorting(table) };
}

function forwardClick(event: React.MouseEvent<HTMLElement>, table: HTMLTableElement, sourceIndex: number) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  if (target.closest("a[href]")) return;
  let node: HTMLElement | null = target;
  const boundary = event.currentTarget;
  let interactive: HTMLElement | null = null;
  while (node && node !== boundary) {
    const marked = [...node.attributes].some((attribute) => attribute.name.startsWith("data-") || attribute.name === "onclick");
    if (node.tagName === "BUTTON" || node.tagName === "INPUT" || marked) {
      interactive = node;
      break;
    }
    node = node.parentElement;
  }
  if (!interactive) return;
  const sourceRow = [...(table.tBodies[0]?.rows ?? [])].find((row) => row.rowIndex === sourceIndex);
  const source = [...(sourceRow?.querySelectorAll<HTMLElement>("button, input, [onclick], [data-audit-device], [data-ime-checkin]") ?? [])]
    .find((element) => signature(element) === signature(interactive));
  const broad = source ?? [...(sourceRow?.querySelectorAll<HTMLElement>("*") ?? [])].find((element) => signature(element) === signature(interactive));
  broad?.click();
}

function LiveTable({ table }: { table: HTMLTableElement }) {
  const [snapshot, setSnapshot] = useState<Snapshot>(() => readSnapshot(table));

  useEffect(() => {
    const body = table.tBodies[0];
    if (!body) return;
    const update = () => setSnapshot(readSnapshot(table));
    const observer = new MutationObserver(update);
    observer.observe(body, { childList: true, subtree: true });
    if (table.tHead) observer.observe(table.tHead, { attributes: true, subtree: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, [table]);

  const columns: Array<DataTableColumnDef<RowSnap>> = snapshot.titles.map((title, index) => ({
    id: `c${index}`,
    accessorFn: (row) => row.cells[index]?.html ?? "",
    header: title,
    cell: ({ row }) => {
      const cell = row.original.cells[index];
      return (
        <span
          className={cell?.className}
          data-warn-row={row.original.warn ? "" : undefined}
          onClick={(event) => forwardClick(event, table, row.original.sourceIndex)}
          dangerouslySetInnerHTML={{ __html: cell?.html ?? "" }}
        />
      );
    },
  }));

  return (
    <DataTable
      columns={columns}
      data={snapshot.rows}
      getRowId={(row) => String(row.sourceIndex)}
      density="compact"
      className="overflow-visible rounded-none border-0 bg-transparent shadow-none"
      pageSize={Math.max(snapshot.rows.length, 1)}
      pagination={{ pageIndex: 0, pageSize: Math.max(snapshot.rows.length, 1) }}
      onPaginationChange={() => undefined}
      manualSorting
      sorting={snapshot.sorting}
      onSortingChange={(updater) => {
        const next = typeof updater === "function" ? updater(snapshot.sorting) : updater;
        const index = Number(String(next[0]?.id || "").slice(1));
        table.tHead?.rows[0]?.cells[index]?.click();
      }}
      showPagination={false}
      empty={snapshot.empty}
    />
  );
}

export function ReportTables() {
  useEffect(() => {
    const root = document.getElementById("legacy-root");
    if (!root) return;
    const legacyRoot = root;
    const mounted = new Map<HTMLTableElement, { reactRoot: Root; host: HTMLDivElement }>();

    function enhance(table: HTMLTableElement) {
      if (table.dataset.tanstack === "1" || !table.tHead?.rows[0]?.cells.length) return;
      if (table.closest(".report-table-host")) return;
      table.dataset.tanstack = "1";
      const host = document.createElement("div");
      host.className = "report-table-host min-w-0 w-full";
      table.before(host);
      table.hidden = true;
      const reactRoot = createRoot(host);
      reactRoot.render(<LiveTable table={table} />);
      mounted.set(table, { reactRoot, host });
    }

    function scan() {
      for (const [table, entry] of mounted) {
        if (!table.isConnected) {
          entry.reactRoot.unmount();
          entry.host.remove();
          mounted.delete(table);
        }
      }
      legacyRoot.querySelectorAll("table").forEach((table) => {
        if (table instanceof HTMLTableElement) enhance(table);
      });
    }

    scan();
    const observer = new MutationObserver(scan);
    observer.observe(legacyRoot, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      for (const [table, entry] of mounted) {
        entry.reactRoot.unmount();
        entry.host.remove();
        table.hidden = false;
        delete table.dataset.tanstack;
      }
      mounted.clear();
    };
  }, []);

  return null;
}
