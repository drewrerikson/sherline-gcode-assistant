import { examples } from "./examples.js";
import { generateProgram } from "./gcode.js";
import { renderPreview } from "./preview.js";
import { normalizeSettings, settingFieldIds } from "./settings.js";
import { applyTheme, loadTheme } from "./theme.js";
import { hasCriticalWarnings } from "./validation.js";

const $ = (id) => document.getElementById(id);

function readSettings() {
  return normalizeSettings({
    machine: $("machine").value,
    units: $("units").value,
    feed: $("feed").value,
    plunge: $("plunge").value,
    rpm: $("rpm").value,
    safe: $("safe").value,
    stepdown: $("stepdown").value,
    tool: $("tool").value
  });
}

function renderWarnings(warnings) {
  const warningList = $("warnings");
  warningList.innerHTML = "";
  warnings.forEach((warning) => {
    const item = document.createElement("li");
    item.className = warning.level;
    item.textContent = warning.text;
    warningList.appendChild(item);
  });
}

function renderProgram() {
  const result = generateProgram($("instructions").value, readSettings());
  $("output").textContent = result.gcode;
  renderPreview($("preview"), result.gcode);
  renderWarnings(result.warnings);
  const blocked = hasCriticalWarnings(result.warnings);
  $("copyButton").disabled = blocked;
  $("downloadButton").disabled = blocked;
  $("copyButton").title = blocked ? "Resolve critical review items before copying" : "Copy G-code";
  $("downloadButton").title = blocked ? "Resolve critical review items before saving" : "Save .ngc";
}

function saveFile() {
  const blob = new Blob([$("output").textContent], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "sherline-program.ngc";
  link.click();
  URL.revokeObjectURL(link.href);
}

function loadExample() {
  $("instructions").value = examples[$("machine").value];
  renderProgram();
}

function bindEvents() {
  document.querySelectorAll(".theme-button").forEach((button) => {
    button.addEventListener("click", () => applyTheme(button.dataset.theme));
  });
  settingFieldIds.forEach((id) => $(id).addEventListener("input", renderProgram));
  $("instructions").addEventListener("input", renderProgram);
  $("downloadButton").addEventListener("click", saveFile);
  $("copyButton").addEventListener("click", async () => {
    await navigator.clipboard.writeText($("output").textContent);
  });
  $("exampleButton").addEventListener("click", loadExample);
  $("machine").addEventListener("change", loadExample);
  window.addEventListener("resize", renderProgram);
}

export function startApp() {
  bindEvents();
  applyTheme(loadTheme());
  renderProgram();
}
