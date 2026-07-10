import assert from "node:assert/strict";
import test from "node:test";
import { generateProgram } from "../src/gcode.js";
import { normalizeSettings } from "../src/settings.js";

function millSettings(overrides = {}) {
  return normalizeSettings({
    machine: "mill",
    units: "inch",
    feed: 4,
    plunge: 1,
    rpm: 1800,
    safe: 0.1,
    stepdown: 0.02,
    tool: 1,
    ...overrides
  });
}

function latheSettings(overrides = {}) {
  return millSettings({ machine: "lathe", ...overrides });
}

test("generates a mill rectangle from size and start coordinates", () => {
  const result = generateProgram("mill a rectangle 1.0 x 0.5 depth 0.05 at x0.25 y0.125", millSettings());

  assert.match(result.gcode, /G20 G90 G17 G40 G49 G80 G94/);
  assert.match(result.gcode, /G0 X0\.25 Y0\.125 Z0\.1/);
  assert.match(result.gcode, /G1 Z-0\.02 F1/);
  assert.match(result.gcode, /G1 X1\.25 F4/);
  assert.match(result.gcode, /G1 Y0\.625/);
  assert.match(result.gcode, /G1 Z-0\.05 F1/);
});

test("generates drilling moves for each hole pair", () => {
  const result = generateProgram(
    "drill holes at x0.25 y0.25 and x0.75 y0.25 depth 0.125",
    millSettings()
  );

  assert.match(result.gcode, /G0 X0\.25 Y0\.25 Z0\.1/);
  assert.match(result.gcode, /G0 X0\.75 Y0\.25 Z0\.1/);
  assert.equal((result.gcode.match(/G1 Z-0\.125 F1/g) || []).length, 2);
});

test("generates circle milling passes around the requested center", () => {
  const result = generateProgram("mill a circle diameter 0.5 depth 0.04 at x0.5 y0.5", millSettings());

  assert.match(result.gcode, /G0 X0\.75 Y0\.5 Z0\.1/);
  assert.match(result.gcode, /G2 X0\.75 Y0\.5 I-0\.25 J0 F4/);
  assert.match(result.gcode, /G1 Z-0\.04 F1/);
});

test("generates lathe header and turning passes", () => {
  const result = generateProgram("turn diameter 0.5 length 1.0 depth 0.08", latheSettings());

  assert.match(result.gcode, /G20 G90 G18 G40 G49 G80 G94/);
  assert.match(result.gcode, /Lathe X values are diameter-mode assumptions/);
  assert.match(result.gcode, /G1 Z-1 F4/);
  assert.ok(result.warnings.some((warning) => warning.text.includes("Lathe output assumes X is diameter mode")));
});

test("reports unsupported instructions without throwing", () => {
  const result = generateProgram("engrave my initials", millSettings());

  assert.match(result.gcode, /\(engrave my initials\)/);
  assert.ok(result.warnings.some((warning) => warning.level === "critical" && warning.text.includes("Unsupported mill instruction")));
});

test("flags empty instructions as critical", () => {
  const result = generateProgram("", millSettings());

  assert.ok(result.warnings.some((warning) => warning.level === "critical" && warning.text.includes("Enter at least one instruction")));
});

test("flags unsafe numeric settings as critical", () => {
  const result = generateProgram(
    "drill holes at x0 y0 depth 0.1",
    millSettings({ feed: 0, plunge: -1, rpm: 0, safe: 0, stepdown: 0, tool: 0 })
  );

  assert.ok(result.warnings.some((warning) => warning.text.includes("Feed rate must be greater than zero")));
  assert.ok(result.warnings.some((warning) => warning.text.includes("Plunge rate must be greater than zero")));
  assert.ok(result.warnings.some((warning) => warning.text.includes("Spindle RPM must be greater than zero")));
  assert.ok(result.warnings.some((warning) => warning.text.includes("Safe height must be greater than zero")));
  assert.ok(result.warnings.some((warning) => warning.text.includes("Stepdown must be greater than zero")));
  assert.ok(result.warnings.some((warning) => warning.text.includes("Tool number must be a positive whole number")));
});

test("does not emit non-finite values for default normalized settings", () => {
  const result = generateProgram("mill a circle diameter 0.5 depth 0.04 at x0 y0", millSettings());

  assert.doesNotMatch(result.gcode, /NaN|Infinity|undefined/);
});

test("warns about suspicious unit and feed combinations", () => {
  const inchResult = generateProgram("drill holes at x0 y0 depth 0.1", millSettings({ feed: 100 }));
  const mmResult = generateProgram("drill holes at x0 y0 depth 2", millSettings({ units: "mm", feed: 1 }));

  assert.ok(inchResult.warnings.some((warning) => warning.text.includes("high for inch mode")));
  assert.ok(mmResult.warnings.some((warning) => warning.text.includes("low for millimeter mode")));
});
