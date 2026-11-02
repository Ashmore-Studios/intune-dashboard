import { summariseFleet } from "../dashboard/summarise";

const MSAL_SRC = "https://cdn.jsdelivr.net/npm/@azure/msal-browser@3.27.0/lib/msal-browser.min.js";
const MSAL_SRI = "sha384-8zg7Eb13Jv4vByCkXozj1LKSUykPghS+Zp1Q9BA8lYkMDbushxoDjh+RQ+4r1DNd";
const PAPA_SRC = "https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js";
const PAPA_SRI = "sha384-D/t0ZMqQW31H3az8ktEiNb39wyKnS82iFY52QPACM+IjKW3jDUhyIgh2PApRqJZs";

const revision = encodeURIComponent(new URL(import.meta.url).pathname.split("/").pop() || "dev");

function legacyScript(path: string) {
  return `${path}?v=${revision}`;
}

function loadScript(src: string, integrity?: string) {
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    script.crossOrigin = "anonymous";
    if (integrity) script.integrity = integrity;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Could not load ${src}`));
    document.body.appendChild(script);
  });
}

let bootPromise: Promise<void> | null = null;

export function bootLegacy(host: HTMLElement) {
  if (bootPromise) return bootPromise;
  window.braysSummarise = summariseFleet;
  bootPromise = (async () => {
    const response = await fetch("/legacy-body.html", { cache: "no-store" });
    if (!response.ok) throw new Error("The reporting workspace could not be loaded.");
    host.innerHTML = await response.text();
    await loadScript(MSAL_SRC, MSAL_SRI);
    await loadScript(PAPA_SRC, PAPA_SRI);
    await loadScript(legacyScript("/js/msal-config.js"));
    await loadScript(legacyScript("/js/graph.js"));
    await loadScript(legacyScript("/js/engine.js"));
  })();
  return bootPromise;
}
