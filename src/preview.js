const rapidColor = "#9ca3af";
const feedColor = "#0f766e";
const arcColor = "#d97706";

function codeValue(line, code) {
  const match = line.match(new RegExp(`${code}\\s*([-+]?\\d*\\.?\\d+)`, "i"));
  return match ? Number.parseFloat(match[1]) : undefined;
}

function isFinitePoint(point) {
  return Number.isFinite(point.x) && Number.isFinite(point.y);
}

function fit(points, width, height) {
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const spanX = Math.max(maxX - minX, 0.001);
  const spanY = Math.max(maxY - minY, 0.001);
  const pad = 24;
  const scale = Math.min((width - pad * 2) / spanX, (height - pad * 2) / spanY);

  return (point) => ({
    x: pad + (point.x - minX) * scale,
    y: height - pad - (point.y - minY) * scale
  });
}

export function parsePreviewMoves(gcode) {
  const moves = [];
  let current = { x: 0, y: 0 };
  let activeMotion = "G0";

  gcode.split(/\r?\n/).forEach((rawLine) => {
    const line = rawLine.replace(/\([^)]*\)/g, "").trim();
    if (!line) return;

    const motion = line.match(/\bG([0123])\b/i);
    if (motion) activeMotion = `G${motion[1]}`;
    if (!["G0", "G1", "G2", "G3"].includes(activeMotion)) return;

    const next = {
      x: codeValue(line, "X") ?? current.x,
      y: codeValue(line, "Y") ?? current.y
    };

    if (!isFinitePoint(next) || (next.x === current.x && next.y === current.y)) {
      current = next;
      return;
    }

    moves.push({
      type: activeMotion,
      from: current,
      to: next,
      i: codeValue(line, "I"),
      j: codeValue(line, "J")
    });
    current = next;
  });

  return moves;
}

function drawGrid(ctx, width, height) {
  ctx.strokeStyle = "#d8ddd6";
  ctx.lineWidth = 1;
  for (let x = 0; x <= width; x += 48) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y <= height; y += 48) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

export function renderPreview(canvas, gcode) {
  const ctx = canvas.getContext("2d");
  const rect = canvas.getBoundingClientRect();
  const scale = window.devicePixelRatio || 1;
  const width = Math.max(Math.round(rect.width), 1);
  const height = Math.max(Math.round(rect.height), 1);
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  ctx.scale(scale, scale);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#fbfcfa";
  ctx.fillRect(0, 0, width, height);
  drawGrid(ctx, width, height);

  const moves = parsePreviewMoves(gcode);
  const points = moves.flatMap((move) => [move.from, move.to]);
  if (points.length === 0) {
    ctx.fillStyle = "#607066";
    ctx.font = "14px system-ui, sans-serif";
    ctx.fillText("No XY toolpath to preview", 18, 28);
    return;
  }

  const project = fit(points, width, height);
  moves.forEach((move) => {
    const from = project(move.from);
    const to = project(move.to);
    ctx.strokeStyle = move.type === "G0" ? rapidColor : move.type === "G1" ? feedColor : arcColor;
    ctx.lineWidth = move.type === "G0" ? 1.5 : 2.5;
    ctx.setLineDash(move.type === "G0" ? [6, 5] : []);
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  });
  ctx.setLineDash([]);
}
