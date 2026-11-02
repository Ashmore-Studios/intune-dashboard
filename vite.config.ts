import { readFileSync } from "node:fs";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

function phosphorCss(weight: "regular" | "fill") {
  const css = readFileSync(
    new URL(`./node_modules/@phosphor-icons/web/src/${weight}/style.css`, import.meta.url),
    "utf8",
  );
  const font = weight === "fill" ? "Phosphor-Fill.woff2" : "Phosphor.woff2";
  return css.replace(
    /src:\s*[\s\S]*?format\("svg"\);/,
    `src: url("../node_modules/@phosphor-icons/web/src/${weight}/${font}") format("woff2");`,
  );
}

function phosphorWoff2Only(): Plugin {
  return {
    name: "phosphor-woff2-only",
    enforce: "pre",
    transform(code, id) {
      if (!id.endsWith("/src/styles.css")) return;
      return code
        .replace('@import "@phosphor-icons/web/regular";', () => phosphorCss("regular"))
        .replace('@import "@phosphor-icons/web/fill";', () => phosphorCss("fill"));
    },
  };
}

export default defineConfig({
  plugins: [phosphorWoff2Only(), react(), tailwindcss()],
});
