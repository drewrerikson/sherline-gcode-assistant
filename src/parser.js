export function parseInstructionLines(instructions) {
  return instructions
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function parseValue(text, names, fallback = undefined) {
  const nameGroup = names.join("|");
  const match = text.match(new RegExp(`(?:${nameGroup})\\s*([-+]?\\d*\\.?\\d+)`, "i"));
  return match ? Number.parseFloat(match[1]) : fallback;
}

export function parseSize(text) {
  const match = text.match(/([-+]?\d*\.?\d+)\s*(?:x|by)\s*([-+]?\d*\.?\d+)/i);
  return match
    ? { width: Number.parseFloat(match[1]), height: Number.parseFloat(match[2]) }
    : null;
}

export function parsePair(text, fallbackX = 0, fallbackY = 0) {
  const contextual = text.match(/(?:at|center|centre|from|start)\s+x\s*([-+]?\d*\.?\d+)\s*y\s*([-+]?\d*\.?\d+)/i);
  if (contextual) {
    return {
      x: Number.parseFloat(contextual[1]),
      y: Number.parseFloat(contextual[2])
    };
  }

  const pairs = parseHolePairs(text);
  if (pairs.length > 0) {
    return pairs[pairs.length - 1];
  }

  return {
    x: parseValue(text, ["x"], fallbackX),
    y: parseValue(text, ["y"], fallbackY)
  };
}

export function parseHolePairs(text) {
  const pairs = [];
  const regex = /x\s*([-+]?\d*\.?\d+)\s*y\s*([-+]?\d*\.?\d+)/gi;
  let match;
  while ((match = regex.exec(text))) {
    pairs.push({ x: Number.parseFloat(match[1]), y: Number.parseFloat(match[2]) });
  }
  return pairs;
}
