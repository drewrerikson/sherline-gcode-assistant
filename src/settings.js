import { num } from "./number-format.js";

export const settingFieldIds = ["machine", "units", "feed", "plunge", "rpm", "safe", "stepdown", "tool"];

export function normalizeSettings(raw) {
  const unit = raw.units;
  const rpm = num(raw.rpm, 1800);
  const stepdown = num(raw.stepdown, unit === "inch" ? 0.02 : 0.5);
  const tool = num(raw.tool, 1);
  return {
    machine: raw.machine,
    units: unit,
    unitCode: unit === "inch" ? "G20" : "G21",
    feedMode: "G94",
    feed: num(raw.feed, unit === "inch" ? 4 : 100),
    plunge: num(raw.plunge, unit === "inch" ? 1 : 25),
    rpm: Number.isFinite(rpm) ? Math.round(rpm) : rpm,
    safe: num(raw.safe, unit === "inch" ? 0.1 : 3),
    stepdown,
    tool: Number.isFinite(tool) ? Math.round(tool) : tool,
    decimals: unit === "inch" ? 4 : 3
  };
}
