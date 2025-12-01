const array_length = 100_000

const start = performance.now()
let count = 0
for (let index = 0; index < array_length; index++) {
  count++
  const calc = some_lightest_calculations()
  if (index === 10_000) {
    count--
    console.log('index', index)
    console.log('calc', JSON.stringify(calc))
  }
}
const end = performance.now() - start
console.log(end)

function some_lightest_calculations() {
  const sx = 12
  const sy = 100
  const tx = 400
  const ty = 300
  const cp = {
    x: 500,
    y: 500,
  }
  const angle = findAngle(cp.x, cp.y, tx, ty)
  const arrowX = tx - Math.cos(angle) * 10
  const arrowY = ty - Math.sin(angle) * 10
  return { angle, arrowX, arrowY }
}

function findAngle(sx, sy, ex, ey) {
  // make sx and sy at the zero point
  return Math.atan2((ey - sy) / (ex - sx))
}

function some_accumulates() {
  const sx = 12
  const sy = 100
  const tx = 400
  const ty = 300
  const cp = {
    x: 500,
    y: 500,
  }

  const arrowSize = 10
  // accurate curve length
  // const L = quadLength(sx, sy, cp.x, cp.y, tx, ty)
  const L = 10
  // choose t based on real curve length
  const desired = 10 + arrowSize * 0.9
  const t = Math.max(0.02, Math.min(0.99, 1 - desired / L))

  // point on curve
  const pt = quadPoint(sx, sy, cp.x, cp.y, tx, ty, t)

  // derivative for correct orientation
  const d = quadDerivative(sx, sy, cp.x, cp.y, tx, ty, t)
  const angle = Math.atan2(d.dy, d.dx)
}

function quadLength(x1, y1, cx, cy, x2, y2, steps = 12) {
  let px = x1,
    py = y1
  let length = 0

  for (let i = 1; i <= steps; i++) {
    const t = i / steps
    const p = quadPoint(x1, y1, cx, cy, x2, y2, t)
    length += Math.hypot(p.x - px, p.y - py)
    px = p.x
    py = p.y
  }

  return length
}
/** Math helpers */
const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
const length = (dx, dy) => Math.hypot(dx, dy)
/** Quadratic Bezier point at t */
function quadPoint(x1, y1, cx, cy, x2, y2, t) {
  const u = 1 - t
  const uu = u * u
  const tt = t * t
  return {
    x: uu * x1 + 2 * u * t * cx + tt * x2,
    y: uu * y1 + 2 * u * t * cy + tt * y2,
  }
}

/** Quadratic derivative at t (dx/dt, dy/dt) */
function quadDerivative(x1, y1, cx, cy, x2, y2, t) {
  // derivative: 2(1-t)(C - P0) + 2t(P2 - C)
  const u = 1 - t
  const dx = 2 * u * (cx - x1) + 2 * t * (x2 - cx)
  const dy = 2 * u * (cy - y1) + 2 * t * (y2 - cy)
  return { dx, dy }
}
