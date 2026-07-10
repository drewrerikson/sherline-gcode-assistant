import { parseInstructionLines } from "./parser.js";

function add(warnings, level, text) {
  warnings.push({ level, text });
}

function finitePositive(value) {
  return Number.isFinite(value) && value > 0;
}

export function hasCriticalWarnings(warnings) {
  return warnings.some((warning) => warning.level === "critical");
}

export function validateSettings(settings) {
  const warnings = [];

  if (!["mill", "lathe"].includes(settings.machine)) {
    add(warnings, "critical", "Select a supported machine before generating code.");
  }

  if (!["inch", "mm"].includes(settings.units)) {
    add(warnings, "critical", "Select inches or millimeters before generating code.");
  }

  if (!finitePositive(settings.feed)) {
    add(warnings, "critical", "Feed rate must be greater than zero.");
  }

  if (!finitePositive(settings.plunge)) {
    add(warnings, "critical", "Plunge rate must be greater than zero.");
  }

  if (!finitePositive(settings.rpm)) {
    add(warnings, "critical", "Spindle RPM must be greater than zero.");
  }

  if (!finitePositive(settings.safe)) {
    add(warnings, "critical", "Safe height must be greater than zero.");
  }

  if (!finitePositive(settings.stepdown)) {
    add(warnings, "critical", "Stepdown must be greater than zero.");
  }

  if (!Number.isInteger(settings.tool) || settings.tool < 1) {
    add(warnings, "critical", "Tool number must be a positive whole number.");
  }

  if (settings.units === "inch" && settings.feed > 60) {
    add(warnings, "normal", "Feed rate is high for inch mode; confirm units and machine limits.");
  }

  if (settings.units === "mm" && settings.feed < 10) {
    add(warnings, "normal", "Feed rate is low for millimeter mode; confirm units.");
  }

  return warnings;
}

export function validateInstructions(instructions) {
  const warnings = [];
  if (parseInstructionLines(instructions).length === 0) {
    add(warnings, "critical", "Enter at least one instruction before generating code.");
  }
  return warnings;
}
