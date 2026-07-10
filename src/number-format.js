export function num(value, fallback = 0) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function fmt(value, decimals) {
  const fixed = Number(value).toFixed(decimals);
  return fixed.replace(/\.?0+$/, "");
}
