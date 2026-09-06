// Nothing stands on the road.
//
//   node tools/clearance.js            # every circuit
//   node tools/clearance.js monaco     # one, listing each offender
//
// The scattered props - trees, dunes, grandstands, corner boards - are already
// checked as they are placed, against a grid of every node on the circuit. The
// measured ones were not. A building imported out of OpenStreetMap is added with
// `fixed: true`, meaning it stands where that building stands and is not to be
// nudged, and the placement check was never asked about it at all.
//
// That is fine right up until the lap folds back on itself. Monaco passes within
// twenty metres of itself in four places and under itself in one, and a building
// measured as ninety metres off the road at Portier is sitting on the road at
// Sainte Dévote. It is drawn there too, which is what "there are polygons across
// the track" turns out to mean.
//
// So this asks the question the placement never did, of every prop on every
// circuit: is there any piece of road, other than the piece you were measured
// against, inside your own footprint?

import { buildRoute, spreadOf } from '../src/game/route.js';
import { ROUTES } from '../src/game/state.js';

/** Things that cross the road on purpose and are not trespassing when they do. */
const SPANS = new Set(['flyover', 'gantry', 'arch', 'bridge', 'span', 'chopper', 'balloon']);


/**
 * Every prop that is standing on a piece of road it does not belong to.
 *
 * `slack` is how far inside the road edge a prop has to reach before it counts.
 * A little is deliberate: a barrier stands right on the edge and a corner board
 * leans over the kerb, and calling those faults would mean removing them.
 */
export function trespassers(route, slack = 1.5) {
  const nodes = route.nodes;
  const count = nodes.length;
  const CELL = 20;
  let minX = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxZ = -Infinity;
  for (const n of nodes) {
    minX = Math.min(minX, n.x);
    maxX = Math.max(maxX, n.x);
    minZ = Math.min(minZ, n.z);
    maxZ = Math.max(maxZ, n.z);
  }
  const cols = Math.max(1, Math.ceil((maxX - minX) / CELL) + 1);
  const rows = Math.max(1, Math.ceil((maxZ - minZ) / CELL) + 1);
  const grid = new Array(cols * rows);
  for (const n of nodes) {
    const col = Math.max(0, Math.min(cols - 1, Math.floor((n.x - minX) / CELL)));
    const row = Math.max(0, Math.min(rows - 1, Math.floor((n.z - minZ) / CELL)));
    (grid[col + row * cols] ||= []).push(n);
  }

  const found = [];
  for (let i = 0; i < count; i++) {
    const props = route.props[i];
    if (!props) continue;
    const a = nodes[i];
    for (const prop of props) {
      // Some things are over the road because that is what they are: a flyover
      // deck, a gantry, the arch at the start line, a footbridge. They stand on
      // the centre line and span it.
      if (SPANS.has(prop.kind) || prop.lift > 6) continue;
      const off = prop.side * prop.off;
      const x = a.x + a.nx * off;
      const z = a.z + a.nz * off;
      const spread = spreadOf(prop);

      const cx = Math.floor((x - minX) / CELL);
      const cz = Math.floor((z - minZ) / CELL);
      const reach = Math.ceil((spread + 15) / CELL);
      let worst = null;
      for (let dz = -reach; dz <= reach; dz++) {
        for (let dx = -reach; dx <= reach; dx++) {
          const col = cx + dx;
          const row = cz + dz;
          if (col < 0 || col >= cols || row < 0 || row >= rows) continue;
          const cell = grid[col + row * cols];
          if (!cell) continue;
          for (const n of cell) {
            // Its own stretch of road, which it was measured against and is
            // meant to stand beside.
            const apart = Math.abs(n.i - i);
            if (Math.min(apart, count - apart) <= 2) continue;
            const want = n.half + slack + spread;
            const into = want - Math.hypot(x - n.x, z - n.z);
            if (into > 0 && (!worst || into > worst.into)) worst = { into, node: n };
          }
        }
      }
      if (worst) {
        found.push({
          at: i, kind: prop.kind, into: worst.into, node: worst.node.i, spread,
        });
      }
    }
  }
  return found;
}

if (process.argv[1] && process.argv[1].endsWith('clearance.js')) {
  const asked = process.argv[2];
  const keys = asked ? [asked] : Object.keys(ROUTES);
  let total = 0;
  let worstAny = 0;
  for (const key of keys) {
    const route = buildRoute(key);
    const bad = trespassers(route);
    const count = Object.values(route.props).reduce((n, p) => n + (p ? p.length : 0), 0);
    total += bad.length;
    const deep = bad.reduce((m, b) => Math.max(m, b.into), 0);
    worstAny = Math.max(worstAny, deep);
    const kinds = {};
    for (const b of bad) kinds[b.kind] = (kinds[b.kind] || 0) + 1;
    const how = Object.entries(kinds).sort((a, b) => b[1] - a[1])
      .map(([k, n]) => `${n} ${k}`).join(', ');
    console.log(`${key.padEnd(12)} ${String(bad.length).padStart(4)} of ${String(count).padStart(5)} props on the road`
      + (bad.length ? `, worst ${deep.toFixed(1)} m in  (${how})` : ''));
    if (asked) {
      for (const b of bad.sort((x, y) => y.into - x.into).slice(0, 25)) {
        console.log(`    ${b.kind.padEnd(9)} at node ${String(b.at).padStart(5)}`
          + ` reaches ${b.into.toFixed(1)} m into the road at node ${b.node}`);
      }
    }
  }
  console.log(`\n${total} across ${keys.length} circuits, worst ${worstAny.toFixed(1)} m in`);
  // Run from `npm test`, so a prop that lands on the road fails the build rather
  // than waiting to be noticed from the car.
  process.exit(total ? 1 : 0);
}
