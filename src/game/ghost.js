// A lap, recorded as a time at every node, and played back against you.
//
// The obvious way to record a ghost is to write down where the car is on every
// tick. A lap of Monaco is seventy-five seconds, which is four and a half
// thousand ticks, and as raw numbers that is tens of kilobytes - too much to
// keep beside a score on a board that refuses anything over sixty-four.
//
// The circuit is already cut into nodes six metres apart, so this records the
// time the car crossed each of them and how far off the centre line it was.
// Monaco is five hundred and fifty-four nodes: eleven hundred numbers, delta
// encoded in base thirty-six the same way the centre lines are, and it comes to
// two or three kilobytes.
//
// Three things fall out of that one recording:
//
//   - the ghost car, which is where the lap was at this moment
//   - the live difference, which is where the lap was at this *place* - and
//     that is the part that makes a time trial worth driving
//   - sector times, which are the same numbers read three at a time
//
// And it is frame-rate independent by construction. A ghost recorded on a
// sixty hertz screen plays back at exactly the same speed on a hundred and
// twenty, because nothing here is counted in frames.

import { SEG } from '../constants.js';

// Times are kept in ticks, which is what the simulation counts in: a sixtieth
// of a second, finer than a lap time is ever read to, and already a whole
// number, so there is nothing to scale and nothing to round away. It also keeps
// the deltas tiny - a node is six metres, so at racing speed the gap between two
// of them is three or four ticks, which is one character.

/** Decimetres, across a road that is ten to sixteen metres wide. */
const ACROSS = 10;

/**
 * A recorder for one lap.
 *
 * Nodes are crossed in order, so this only has to remember which one is next.
 * Driving backwards over a node does not un-record it: a lap driven backwards
 * is not a lap anybody wants the ghost of, and it will not be the best one.
 */
export function tape(nodes) {
  return {
    times: new Float64Array(nodes),
    xs: new Float64Array(nodes),
    next: 0,
    nodes,
    // Where the car was on the tick before this one, so that a node crossed
    // between two ticks can be timed rather than rounded up to the later one.
    was: 0,
    wasAt: 0,
  };
}

/**
 * Where the car has got to, at this instant.
 *
 * `along` is how far into the lap it is, in metres, and `at` is the lap time so
 * far. Called every tick; does nothing at all on most of them.
 */
export function note(rec, along, across, at) {
  while (rec.next < rec.nodes && along >= rec.next * SEG) {
    // A node is six metres and a tick at racing speed is a metre and a half, so
    // the car is never on a node when the clock is looked at - it crossed it
    // somewhere in the last tick. Timed to the whole tick the recording was four
    // ticks out against itself, which is seven hundredths and shows on a
    // difference read to two decimals. Timed to where it actually crossed, it is
    // half a tick.
    const want = rec.next * SEG;
    const moved = along - rec.was;
    const part = moved > 0 ? Math.max(0, Math.min(1, (want - rec.was) / moved)) : 1;
    rec.times[rec.next] = rec.wasAt + (at - rec.wasAt) * part;
    rec.xs[rec.next] = across;
    rec.next++;
  }
  rec.was = along;
  rec.wasAt = at;
}

/** Is this a whole lap, or did it stop somewhere? */
export function whole(rec) {
  return rec.next >= rec.nodes;
}

/**
 * The recording, as one short string.
 *
 * Two delta chains rather than two lists: a lap time climbs by about a twentieth
 * of a second per node and a car moves a few decimetres across the road, so the
 * differences are one or two characters where the values would be four.
 */
export function pack(rec, lap) {
  // The lap time first, because the last node is not the finishing line: it is
  // a few metres before it, and the difference is the tenth that decides who is
  // top of the board.
  const out = [Math.round(lap ?? rec.times[rec.nodes - 1]).toString(36)];
  let time = 0;
  let across = 0;
  for (let i = 0; i < rec.nodes; i++) {
    const t = Math.round(rec.times[i]);
    const x = Math.round(rec.xs[i] * ACROSS);
    out.push((t - time).toString(36), (x - across).toString(36));
    time = t;
    across = x;
  }
  return out.join(' ');
}

/** And back again. Returns null for anything that is not a lap. */
export function unpack(packed, nodes) {
  if (typeof packed !== 'string' || !packed) return null;
  const parts = packed.split(' ');
  if (parts.length !== nodes * 2 + 1) return null;
  const lap = parseInt(parts[0], 36);
  if (!Number.isFinite(lap) || lap <= 0) return null;
  const times = new Float64Array(nodes);
  const xs = new Float64Array(nodes);
  let time = 0;
  let across = 0;
  for (let i = 0; i < nodes; i++) {
    const t = parseInt(parts[i * 2 + 1], 36);
    const x = parseInt(parts[i * 2 + 2], 36);
    if (!Number.isFinite(t) || !Number.isFinite(x)) return null;
    time += t;
    across += x;
    // A lap that goes backwards in time is not a lap.
    if (i > 0 && time < times[i - 1]) return null;
    times[i] = time;
    xs[i] = across / ACROSS;
  }
  return { times, xs, nodes, lap, time: times[nodes - 1] };
}

/**
 * Where the ghost was, this far into its lap.
 *
 * Walked from the last answer rather than searched from the start: playback asks
 * for a time a fraction later than the one before, every frame, so the walk is
 * almost always nought or one step.
 */
export function at(ghost, when, from = 0) {
  const { times, nodes } = ghost;
  let i = Math.max(0, Math.min(nodes - 2, from));
  while (i < nodes - 2 && times[i + 1] <= when) i++;
  while (i > 0 && times[i] > when) i--;
  const span = times[i + 1] - times[i];
  const t = span > 0 ? Math.max(0, Math.min(1, (when - times[i]) / span)) : 0;
  return {
    i,
    along: (i + t) * SEG,
    across: ghost.xs[i] + (ghost.xs[i + 1] - ghost.xs[i]) * t,
    done: when >= times[nodes - 1],
  };
}

/**
 * What the ghost's clock said *here*, which is what a live difference is made
 * of.
 *
 * The ghost car tells you where the lap was at this moment. This tells you where
 * it was at this place, and the two are not the same question: one is somebody
 * driving beside you and the other is a number that says you are three tenths
 * down. It is the number people actually read.
 */
export function timeAt(ghost, along, metres = 0) {
  const { times, nodes, lap } = ghost;
  const raw = along / SEG;
  if (raw <= 0) return times[0];
  if (raw >= nodes - 1) {
    // Past the last node, which is not the finishing line: nodes are six metres
    // apart and a lap is not a whole number of them, so there is always a last
    // stretch with no node on it. Clamped here instead, the ghost's clock stopped
    // for those few metres while yours kept going, and the difference gained
    // four ticks in the last car length of every lap - which read as losing
    // seven hundredths on the line, every time, to a lap you had matched.
    const last = (nodes - 1) * SEG;
    if (!metres || metres <= last || !lap) return times[nodes - 1];
    const t = Math.min(1, (along - last) / (metres - last));
    return times[nodes - 1] + (lap - times[nodes - 1]) * t;
  }
  const i = Math.floor(raw);
  return times[i] + (times[i + 1] - times[i]) * (raw - i);
}

/**
 * Everything a recorded lap has to be before it is worth a byte of storage.
 *
 * Run by both servers rather than by one of them, the same way the score merge
 * is: the Worker and the local board have to agree about what a lap is, or a
 * recording that is fine in development is refused when it goes live.
 */
export
function cleanGhost(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const nodes = Math.round(Number(raw.nodes));
  const time = Math.round(Number(raw.time));
  const lap = String(raw.lap || '');
  // Ten seconds is not a lap and an hour is not a lap either, which are the same
  // bounds the board itself uses. A recording is two numbers per node and a lap
  // time in front of them, in base thirty-six with spaces between.
  if (!Number.isFinite(nodes) || nodes < 100 || nodes > 4000) return null;
  if (!Number.isFinite(time) || time < 600 || time > 216000) return null;
  if (!/^[0-9a-z -]+$/.test(lap)) return null;
  if (lap.split(' ').length !== nodes * 2 + 1) return null;
  return {
    nodes,
    time,
    lap,
    name: String(raw.name || '').toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 3) || 'AAA',
    at: Date.now(),
  };
}
