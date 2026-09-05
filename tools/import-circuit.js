/**
 * A surveyed circuit, turned into something the game can ship.
 *
 * Run against the CSVs from the TUM racetrack database, which give a centre line
 * in metres and the width of the tarmac either side of it. What comes out is the
 * table in src/game/circuits.js: the same line at ten metre spacing, in
 * decimetres, stored as deltas.
 *
 * Ten metres and a decimetre is not a compromise on accuracy, it is a
 * compromise on file size that costs no accuracy. buildRoute runs a spline
 * through these points before it resamples them to six, so the corner it drives
 * is the curve through the survey rather than a chain of ten metre chords - and
 * a tenth of a metre is a twentieth of the width of a wheel.
 *
 *   node tools/import-circuit.js <dir-of-csvs>
 *
 * Provenance and licence are in docs/CIRCUITS.md. Nothing downstream of this
 * file knows the data came from anywhere in particular.
 */

import fs from 'node:fs';
import path from 'node:path';

/** Metres between stored points. The engine resamples to SEG afterwards. */
const STORE = 10;

const WANTED = {
  Monza: 'monza',
  Spa: 'spa',
  Suzuka: 'suzuka',
  Zandvoort: 'zandvoort',
  Silverstone: 'silverstone',
  SaoPaulo: 'interlagos',
  Spielberg: 'spielberg',
  Montreal: 'montreal',
};

function read(file) {
  return fs.readFileSync(file, 'utf8')
    .split('\n')
    .filter((l) => l.trim() && !l.startsWith('#'))
    .map((l) => l.split(',').map(Number))
    // x_m,y_m,w_tr_right_m,w_tr_left_m -> the game's ground plane, and one half
    // width. The two sides are kept separately in the survey because a racing
    // line cares; a road drawn symmetrically about its centre does not.
    .map(([x, y, r, l]) => ({ x, z: y, half: (r + l) / 2 }));
}

/** The closed line again, with its points a fixed distance apart. */
function resample(poly, seg) {
  const n = poly.length;
  const run = [0];
  for (let i = 1; i <= n; i++) {
    const a = poly[i - 1];
    const b = poly[i % n];
    run.push(run[i - 1] + Math.hypot(b.x - a.x, b.z - a.z));
  }
  const total = run[n];
  const count = Math.round(total / seg);
  const step = total / count;
  const out = [];
  let at = 0;
  for (let i = 0; i < count; i++) {
    const want = i * step;
    while (at < n - 1 && run[at + 1] < want) at++;
    const span = run[at + 1] - run[at] || 1;
    const t = (want - run[at]) / span;
    const a = poly[at];
    const b = poly[(at + 1) % n];
    const mix = (k) => a[k] + (b[k] - a[k]) * t;
    out.push({ x: mix('x'), z: mix('z'), half: mix('half') });
  }
  return { out, total };
}

/**
 * Deltas in decimetres, base-36, comma free.
 *
 * Stored as differences because a circuit is a walk: consecutive points are ten
 * metres apart however far the circuit is from its own origin, so the numbers
 * stay two or three characters wide instead of five.
 */
function pack(points) {
  const parts = [];
  let px = 0;
  let pz = 0;
  let ph = 0;
  for (const p of points) {
    const x = Math.round(p.x * 10);
    const z = Math.round(p.z * 10);
    const h = Math.round(p.half * 10);
    parts.push(`${(x - px).toString(36)} ${(z - pz).toString(36)} ${(h - ph).toString(36)}`);
    px = x;
    pz = z;
    ph = h;
  }
  return parts.join(' ');
}

const dir = process.argv[2];
if (!dir) {
  console.error('usage: node tools/import-circuit.js <dir-of-csvs>');
  process.exit(1);
}

const out = [];
for (const [file, key] of Object.entries(WANTED)) {
  const full = path.join(dir, `${file}.csv`);
  if (!fs.existsSync(full)) {
    console.error(`missing ${full}`);
    process.exit(1);
  }
  const { out: pts, total } = resample(read(full), STORE);
  const halves = pts.map((p) => p.half);
  out.push({ key, file, pts, total });
  console.error(`${key.padEnd(10)} ${(total / 1000).toFixed(3)} km  ${pts.length} points  `
    + `half-width ${Math.min(...halves).toFixed(1)}-${Math.max(...halves).toFixed(1)} m`);
}

const body = out.map(({ key, pts }) => `  ${key}: '${pack(pts)}',`).join('\n');
process.stdout.write(`${body}\n`);
