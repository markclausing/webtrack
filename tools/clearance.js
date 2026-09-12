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
import { BANDS, bandInner, FLAT_DROP, groundY, levelWith, roadY } from '../src/render/renderer.js';
import { ROUTES } from '../src/game/state.js';
import { RUMBLE } from '../src/constants.js';

/**
 * Everything that is standing on the ground, and how far off it is.
 *
 * A prop is drawn at one of two heights: `flat` puts it level with the road and
 * anything else puts it on the ground where it stands. Level with the road is
 * right for a grandstand looking at it and for a lamp post beside a boulevard
 * where the ground at that distance is the sea - but the road's height is
 * extrapolated out to wherever the prop is, and on a banked corner that plane
 * climbs. Eighteen degrees of dish at Zandvoort and a lamp post sixteen metres
 * out is five metres of air under it.
 *
 * `lift` is for the things that are meant to be up there, and they are excused.
 */
export function floating(route) {
  const found = [];
  for (let i = 0; i < route.nodes.length; i++) {
    const props = route.props[i];
    if (!props) continue;
    const a = route.nodes[i];
    for (const prop of props) {
      if (prop.lift) continue;
      const off = prop.side * prop.off;
      const under = groundY(a, Math.sign(off) || 1, Math.abs(off));
      const foot = prop.flat ? levelWith(a, off) : under;
      /**
       * A prop is standing on something if it is on the ground, or if it is
       * level with the edge of the road.
       *
       * Both are right and which one is right depends on where it is. A marker
       * post beside a road that runs along a cliff top belongs at road level -
       * you cannot see the drop from the car and a post that followed the cliff
       * down would be under the barrier. A grandstand on the slope below
       * Interlagos belongs on the slope.
       *
       * What is wrong is neither: floating between the two, which is what a
       * banked corner used to do to everything near it by extending the road's
       * plane out to wherever the prop was standing.
       */
      /**
       * On the ground, or level with the edge of the road, and nothing between.
       *
       * Both are right and there is no single answer. A marker post beside a
       * road along a cliff top belongs at road level - you cannot see the drop
       * from the car, and a post that followed the cliff down would be hanging
       * under the barrier. A grandstand on the slope below Interlagos belongs on
       * the slope. A tree on a bank stands above the road, which is why "never
       * higher than the road" was the wrong rule as well.
       *
       * What is wrong is neither of them: floating somewhere in between, which
       * is what a banked corner did to everything near it.
       */
      const edge = Math.sign(off) * Math.min(Math.abs(off), a.half);
      const gap = Math.min(Math.abs(foot - under), Math.abs(foot - roadY(a, edge)));
      if (gap > FLAT_DROP + 0.05) found.push({ at: i, kind: prop.kind, gap, off: Math.abs(off) });
    }
  }
  return found;
}

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

/**
 * And nothing is missing from the ground, either.
 *
 * The other half of "there are polygons across the track" is polygons that are
 * not there. The ground beside the road is drawn as four rings, and both ways it
 * could fail to close have happened:
 *
 * **Two rings drawn at different node resolutions.** They share an edge, and an
 * edge traced every node and the same edge traced every fourth node are not the
 * same line. At ninety-five metres off the centre line that chord cut the corner
 * by a hundred and sixty-seven metres at Las Vegas and by between eight and
 * ninety everywhere else - a hole with the sky behind it, on every circuit in
 * the game.
 *
 * **A ring skipped in the middle.** Where the ground turns into a cliff a
 * circuit says so and the rings past that point are not drawn - except the last,
 * which is always drawn because past it there is nothing at all. Starting that
 * one at its own inner edge rather than where the last drawn ring stopped leaves
 * a band of nothing between the two. On Baku that was every node on the lap.
 *
 * Neither was a new bug. Both were invisible while the fog closed at a kilometre
 * and the picture was six hundred and forty pixels across, which is the only
 * reason they lasted: this asks the question of the geometry instead, where the
 * answer does not depend on how far you can see.
 */
function ringGaps(route) {
  const out = [];
  for (let i = 0; i < route.nodes.length; i++) {
    const a = route.nodes[i];
    if (a.deck || (a.tunnel || 0) >= 0.05) continue;

    // Which rings are drawn here, and from where - the same two decisions the
    // renderer makes, and the reason BANDS is exported.
    const spans = [];
    for (let band = 0; band < BANDS.length; band++) {
      if (!(band < a.reach || band === BANDS.length - 1)) continue;
      const [inner0, outer] = BANDS[band];
      const from = band === BANDS.length - 1 && band > a.reach
        ? BANDS[Math.max(0, Math.min(a.reach, BANDS.length - 1))][0]
        : inner0;
      spans.push([from, outer, band]);
    }
    spans.sort((x, y) => x[0] - y[0]);

    // Tiled from the kerb outwards, with nothing left between them.
    const kerb = bandInner(a, BANDS[0][0]);
    let edge = spans.length ? Math.max(spans[0][0], kerb) : 0;
    for (const [nominal, outer] of spans) {
      const from = Math.max(nominal, kerb);
      if (from >= outer) continue;
      if (from > edge + 0.01) out.push({ at: i, kind: 'ring', from: edge, to: from });
      edge = Math.max(edge, outer);
    }

    /**
     * And the first ring starts exactly where the kerb ends.
     *
     * This guards the arithmetic and not the use of it. The bug it was written
     * after was the renderer working the inner edge out from one node and drawing
     * it at both ends of a quad that spans two - a sliver of nothing between the
     * kerb and the grass wherever the road narrows, two and a half metres of it
     * at Austin and something on sixteen of the twenty-four surveyed circuits -
     * and no question asked of the geometry can see that, because the geometry
     * was right and what was done with it was not. What this does catch is the
     * first ring's nominal edge drifting away from the kerb, which is the other
     * half of the same invariant.
     */
    /**
     * And the ground that is drawn is the ground things are stood on.
     *
     * A band is a flat quad between two offsets, so it draws a straight line
     * across itself; `groundY`, which is where every tree, lorry and grandstand
     * beside the road is placed, is a piecewise curve through the height of each
     * ring. While a band is one ring wide the two agree. The last band is not:
     * it is always drawn and where a circuit's ground stops short it stands in
     * for the rings that were skipped, two hundred and forty metres of it in one
     * quad - and everything standing on that stretch was in the air, by up to
     * twenty-three metres at Monaco.
     *
     * It is cut at every ring edge it crosses now, and this is the check that it
     * stays cut: sample across each piece and ask whether the flat quad and the
     * curve still agree.
     */
    for (const [nominal, outer, band] of spans) {
      // The same rule the renderer uses: a band starts at the later of its own
      // edge and the kerb, and one that has been swallowed is not drawn.
      const from = Math.max(nominal, bandInner(a, BANDS[0][0]));
      if (from >= outer) continue;
      const edges = [from];
      for (let k = 0; k < BANDS.length; k++) {
        if (BANDS[k][0] > from && BANDS[k][0] < outer) edges.push(BANDS[k][0]);
      }
      edges.push(outer);
      edges.sort((x, y) => x - y);
      for (const side of [-1, 1]) {
        for (let k = 0; k < edges.length - 1; k++) {
          const y0 = groundY(a, side, edges[k]);
          const y1 = groundY(a, side, edges[k + 1]);
          for (let t = 0.2; t < 1; t += 0.2) {
            const off = edges[k] + (edges[k + 1] - edges[k]) * t;
            const drawn = y0 + (y1 - y0) * t;
            // A metre of slack: the first ring leaves the road at the kerb and
            // is genuinely curved inside itself, by about two thirds of one at
            // Spa, and that has always been so.
            const step = Math.abs(drawn - groundY(a, side, off));
            if (step > 1) {
              out.push({ at: i, kind: 'step', from: off, to: step, band });
              break;
            }
          }
        }
      }
    }

    // The painted width, not the driven one: at the handful of nodes where a lap
    // runs over its own tarmac the road is drawn narrower than it is, and the
    // grass is supposed to start at the edge of what is drawn.
    const edgeHere = (a.paint ?? a.half) + RUMBLE;
    const startsHere = bandInner(a, BANDS[0][0]);
    if (Math.abs(startsHere - edgeHere) > 0.01) {
      out.push({ at: i, kind: 'sliver', from: edgeHere, to: startsHere });
    }

    // And each shared edge traced at the same resolution on both sides, or the
    // two sides of it are two different lines.
    for (let k = 0; k < spans.length - 1; k++) {
      const here = BANDS[spans[k][2]][3];
      const next = BANDS[spans[k + 1][2]][3];
      if (here !== next) {
        out.push({ at: i, kind: 'seam', from: spans[k][1], to: spans[k][1], here, next });
      }
    }
  }
  return out;
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
    const air = floating(route);
    const highest = air.reduce((m, f) => (Math.abs(f.gap) > Math.abs(m) ? f.gap : m), 0);
    const airKinds = {};
    for (const f of air) airKinds[f.kind] = (airKinds[f.kind] || 0) + 1;
    total += air.length;
    const gaps = ringGaps(route);
    total += gaps.length;
    console.log(`${key.padEnd(12)} ${String(bad.length).padStart(4)} on the road, `
      + `${String(air.length).padStart(4)} off the ground`
      + (bad.length ? `, worst ${deep.toFixed(1)} m in` : '')
      + (air.length ? `, worst ${highest.toFixed(1)} m up (`
        + `${Object.entries(airKinds).sort((x, y) => y[1] - x[1])
          .map(([k, n]) => `${n} ${k}`).join(', ')})` : '')
      + (gaps.length ? `, ${gaps.length} nodes with a hole in the ground` : '')
      + `  [${count} props]`);
    if (asked && gaps.length) {
      for (const g of gaps.slice(0, 10)) {
        if (g.kind === 'step') {
          console.log(`    the ground drawn at ${g.from.toFixed(0)} m is ${g.to.toFixed(1)} m `
            + `from where a prop there would stand, at node ${g.at}`);
          continue;
        }
        console.log(g.kind === 'ring'
          ? `    ground missing from ${g.from.toFixed(0)} to ${g.to.toFixed(0)} m at node ${g.at}`
          : g.kind === 'sliver'
            ? `    the grass starts at ${g.to.toFixed(2)} m and the kerb ends at `
              + `${g.from.toFixed(2)} m, at node ${g.at}`
            : `    seam at ${g.from.toFixed(0)} m drawn every ${g.here} one side and `
              + `every ${g.next} the other, at node ${g.at}`);
      }
    }
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
