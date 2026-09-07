// Where the recorded laps are kept, and which one you get to race.
//
// Two of them, and they answer different questions. Your own best on this
// circuit is the one you actually drive against - it is always there, it needs
// no network, and it is beatable by definition, because you set it. The board
// leader is the one you look up to and is worth having for exactly that reason.
//
// Kept apart from the score board on purpose. A recorded lap is two to five
// kilobytes and a board is ten rows in sixty-four; putting the laps in the rows
// would fill it four times over. So a lap is fetched by itself, when there is
// one worth fetching, and never gets in the way of a score being posted.

import { DEFAULT_BOARD } from './config.js';
import { unpack } from './game/ghost.js';

const KEY = 'webtrack.ghost';

/** `('monaco', 'normal')` -> the key its own best lap is filed under. */
function mine(route, tier) {
  return `${KEY}.${route}.${tier}`;
}

/** The address a recorded lap lives at, or null when there is no board. */
export function ghostUrl(level) {
  if (!DEFAULT_BOARD) return null;
  return `${DEFAULT_BOARD.replace(/\/+$/, '')}/ghost?level=${encodeURIComponent(level)}`;
}

/**
 * Your own best lap here, if you have driven one.
 *
 * Stored against the number of nodes it was recorded on: a circuit that gets
 * re-imported is a different road, and a lap driven on the old one would play
 * back through the barriers. That has happened to Monaco three times this month.
 */
export function ownBest(route, tier, nodes, store = globalThis.localStorage) {
  try {
    const raw = store?.getItem(mine(route, tier));
    if (!raw) return null;
    const saved = JSON.parse(raw);
    if (saved.nodes !== nodes) return null;
    const lap = unpack(saved.lap, nodes);
    return lap && { ...lap, name: saved.name || 'YOU', own: true };
  } catch {
    return null;
  }
}

/** Kept only if it is quicker than the one already there. */
export function keepOwn(route, tier, nodes, packed, ticks, name, store = globalThis.localStorage) {
  try {
    const had = ownBest(route, tier, nodes, store);
    if (had && had.lap <= ticks) return false;
    store?.setItem(mine(route, tier), JSON.stringify({ nodes, lap: packed, name }));
    return true;
  } catch {
    return false;
  }
}

/**
 * The quickest lap anybody has posted here.
 *
 * Answers null for every reason there is - no board, no lap yet, a lap recorded
 * on a different version of the circuit, a fetch that failed - because a ghost
 * is a thing to race against and never a thing to wait for.
 */
export async function bestPosted(level, nodes) {
  const url = ghostUrl(level);
  if (!url) return null;
  try {
    const res = await fetch(url, { headers: { accept: 'application/json' } });
    if (!res.ok) return null;
    const body = await res.json();
    if (!body || body.nodes !== nodes) return null;
    const lap = unpack(body.lap, nodes);
    return lap && { ...lap, name: body.name || '???', own: false };
  } catch {
    return null;
  }
}

/**
 * Posting one, which is worth doing only for a lap that would top the board.
 *
 * Fire and forget: the score has already gone, and a recorded lap that does not
 * arrive costs nobody anything.
 */
export async function postGhost(level, nodes, packed, ticks, name) {
  const url = ghostUrl(level);
  if (!url) return false;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ nodes, lap: packed, time: ticks, name }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
