import assert from "node:assert/strict";
import test from "node:test";
import { parsePreviewMoves } from "../src/preview.js";

test("parses rapid, feed, and arc XY moves from generated G-code", () => {
  const moves = parsePreviewMoves(`
    G0 X0 Y0 Z0.1
    G1 X1 Y0 F4
    G1 Y1
    G2 X0 Y1 I-0.5 J0
  `);

  assert.equal(moves.length, 3);
  assert.equal(moves[0].type, "G1");
  assert.deepEqual(moves[0].from, { x: 0, y: 0 });
  assert.deepEqual(moves[0].to, { x: 1, y: 0 });
  assert.equal(moves[2].type, "G2");
  assert.equal(moves[2].i, -0.5);
});
