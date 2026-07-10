import { num } from "./number-format.js";

export const settingFieldIds = ["machine", "units", "feed", "plunge", "rpm", "safe", "stepdown", "tool"];

export function normalizeSettings(raw) {
  const unit = raw.units;
  return {
    machine: raw.machine,
    units: unit,
    unitCode: unit === "inch" ? "G20" : "G21",
    feedMode: "G94",
    feed: num(raw.feed, unit === "inch" ? 4 : 100),
    plunge: num(raw.plunge, unit === "inch" ? 1 : 25),
    rpm: Math.max(0, Math.round(num(raw.rpm, 1800))),
    safe: num(raw.safe, unit === "inch" ? 0.1 : 3),
    stepdown: Math.max(num(raw.stepdown, unit === "inch" ? 0.02 : 0.5), 0.0001),
    tool: Math.max(1, Math.round(num(raw.tool, 1))),
    decimals: unit === "inch" ? 4 : 3
  };
}
