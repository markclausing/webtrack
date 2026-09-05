/**
 * The score board.
 *
 * Ten per list, kept in localStorage so a browser on its own needs nothing at
 * all. Every entry carries an id and the time it was set, which is what lets two
 * boards from two devices be merged later without either winning by being loaded
 * second.
 *
 * This is one of the few pieces of plumbing webtrack does not share word for
 * word with websoccer, webtennis, webracing and webtype, and the reason is the
 * shape of a score. Football keeps a scoreline. The shooter keeps a run, which
 * only goes up. Here it is a time, and a time is the awkward one: smaller wins,
 * so every comparison in the file runs the other way, and a board sorted by the
 * wrong sign looks perfectly plausible until somebody notices the slowest lap is
 * top. Everything else - merging, clearing, the three letters, the Worker that
 * holds it - is the same file the other four run.
 *
 * There is a list per circuit and per setting, because a time on the pass and a
 * time along the sea front are two different numbers about two different tracks,
 * and the setting changes both the clock and how hard the other seven try.
 *
 * Nothing in here touches the simulation, and the store is injectable so the
 * tests can run it without a browser.
 */

/**
 * Where the board is kept, unless the game says otherwise.
 *
 * It has to be said otherwise when several games share an origin, which these
 * five do: all of them live on the same github.io domain, and one key would mean
 * lap times landing in a shooter's table.
 */
export const KEY = 'webtrack.highscores.v3';

export const MODE_KEYS = ['qual', 'gp'];
export const ROUTE_KEYS = [
  'pass', 'coast', 'grand',
  'spa', 'monza', 'suzuka', 'zandvoort',
  'silverstone', 'interlagos', 'spielberg', 'montreal',
  'austin', 'sakhir', 'mexico', 'hungaroring',
];
export const TIERS = ['easy', 'normal', 'hard'];

/**
 * The lists, keyed `qual:pass:hard`.
 *
 * Ninety of them, which sounds like a great many for ten rows each and is
 * still the right number: a qualifying lap on an empty circuit and a race time
 * over three laps are not the same quantity, and putting them in one table would
 * mean a board on which the top row was always a qualifying lap and nobody could
 * see why. Fifteen circuits rather than three is what took it from eighteen; the
 * lists are empty until somebody drives them and an empty list costs two bytes.
 */
export const LEVELS = MODE_KEYS.flatMap(
  (m) => ROUTE_KEYS.flatMap((r) => TIERS.map((t) => `${m}:${r}:${t}`)),
);
export const TABLE_SIZE = 10;
export const NAME_LENGTH = 3;

/** The letters you can pick from, in the order the stick cycles through them. */
export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-';

/**
 * Nobody gets round in under ten seconds, and nobody who took an hour over it
 * was still racing. Both bounds exist to keep a corrupt row or a dishonest one
 * off the board rather than to judge anybody's driving.
 */
const QUICKEST = 600;          // ticks
const SLOWEST = 60 * 60 * 60;
const MAX_METRES = 60000;

const empty = () => Object.fromEntries(LEVELS.map((l) => [l, []]));

function cleanName(name) {
  const up = String(name ?? '').toUpperCase();
  let out = '';
  for (const ch of up) {
    if (ALPHABET.includes(ch) && out.length < NAME_LENGTH) out += ch;
  }
  return out.padEnd(NAME_LENGTH, '-');
}

/**
 * One row, from anywhere: our own storage, another device, or a shared board.
 * Anything unusable comes back null rather than throwing - a corrupt board
 * should cost you a row, not the page.
 */
export function cleanEntry(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const time = Math.round(Number(raw.time));
  if (!Number.isFinite(time) || time < QUICKEST || time > SLOWEST) return null;
  const place = Math.round(Number(raw.place));
  const at = Number(raw.at);
  return {
    id: String(raw.id || '').slice(0, 40) || makeId(),
    name: cleanName(raw.name),
    time,
    // Where you finished, or 1 for a qualifying lap where there was nobody to
    // finish in front of. Not part of the ordering, and on the board because it
    // is the other half of the story: two drivers on the same race time did not
    // have the same race.
    place: Number.isFinite(place) ? Math.max(1, Math.min(99, place)) : 99,
    metres: clampNumber(raw.metres, 0, MAX_METRES),
    at: Number.isFinite(at) && at > 0 ? at : Date.now(),
  };
}

function clampNumber(value, lo, hi) {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n)) return 0;
  return Math.max(lo, Math.min(hi, n));
}

/** Unique enough to tell two entries apart when boards are merged. */
export function makeId() {
  const rand = Math.floor(Math.random() * 0xffffff).toString(36);
  return `${Date.now().toString(36)}-${rand}`;
}

/**
 * Quickest first.
 *
 * A tie goes to whoever finished higher up, which is almost never used and is
 * there for a reason: two identical times mean the one who also won the race is
 * the better drive, and the board should not pretend it cannot tell. After that
 * it goes to whoever got there first.
 */
export function compare(a, b) {
  if (a.time !== b.time) return a.time - b.time;
  if (a.place !== b.place) return a.place - b.place;
  return a.at - b.at;
}

export function sortTable(entries) {
  return [...entries].sort(compare).slice(0, TABLE_SIZE);
}

/** Would this run get on the board? */
export function qualifies(table, entry) {
  const clean = cleanEntry(entry);
  if (!clean) return false;
  // Sorted here rather than trusted: a board that arrived from somewhere else
  // may be in any order, and asking the wrong row would let a worse run in.
  const rows = sortTable(table || []);
  if (rows.length < TABLE_SIZE) return true;
  return compare(clean, rows[rows.length - 1]) < 0;
}

/** Where a run would land, counting from 1, or 0 if it would not. */
export function placeOf(table, entry) {
  const clean = cleanEntry(entry);
  if (!clean) return 0;
  const rows = sortTable([...(table || []), clean]);
  const at = rows.findIndex((r) => r.id === clean.id);
  return at < 0 ? 0 : at + 1;
}

/**
 * Two boards into one. Same id means the same run, however many times it has
 * travelled: a board that has been round three devices must not grow three
 * copies of everything.
 */
export function merge(mine, theirs) {
  const out = empty();
  const a = normalise(mine);
  const b = normalise(theirs);
  for (const level of LEVELS) {
    const seen = new Map();
    for (const raw of [...(a[level] || []), ...(b[level] || [])]) {
      const entry = cleanEntry(raw);
      if (entry && !seen.has(entry.id)) seen.set(entry.id, entry);
    }
    out[level] = sortTable([...seen.values()]);
  }
  return out;
}

/**
 * A board with everything set before `since` dropped.
 *
 * This is what makes emptying the shared board stick. Wiping the server does not
 * wipe anybody's browser, and the next time one of them syncs it posts its own
 * copy straight back. So a cleared board remembers when it was cleared, and
 * refuses anything older.
 */
export function since(board, when) {
  if (!when) return merge({}, board);
  const from = normalise(board);
  const out = {};
  for (const level of LEVELS) {
    out[level] = (from[level] || []).filter((row) => Number(row?.at) >= when);
  }
  return merge({}, out);
}

/** A board with these ids taken out, wherever they sit. */
export function without(board, ids) {
  const drop = new Set(ids || []);
  const from = normalise(board);
  const out = {};
  for (const level of LEVELS) {
    out[level] = (from[level] || []).filter((row) => !drop.has(row?.id));
  }
  return merge({}, out);
}

/** `('gp', 'pass', 'hard')` -> `'gp:pass:hard'`, and anything unknown -> the first list. */
export function levelOf(mode, route = 'pass', tier = 'normal') {
  const key = String(mode).includes(':') ? String(mode) : `${mode}:${route}:${tier}`;
  return LEVELS.includes(key) ? key : LEVELS[0];
}

/** Which mode, circuit and setting a list is for, for putting on screen. */
export function partsOf(key) {
  const [mode, route, tier] = String(key).split(':');
  return {
    mode: MODE_KEYS.includes(mode) ? mode : 'gp',
    route: ROUTE_KEYS.includes(route) ? route : 'pass',
    tier: TIERS.includes(tier) ? tier : 'normal',
  };
}

/**
 * Any board, in the shape this version expects.
 *
 * Runs on the way in rather than as a one-off migration, because there is no
 * moment when every copy of the board has been converted: a browser that has not
 * been opened for a month will post whatever shape it was last left with.
 */
function normalise(board) {
  const out = {};
  for (const [key, rows] of Object.entries(board || {})) {
    if (!Array.isArray(rows)) continue;
    if (!LEVELS.includes(key)) continue;
    (out[key] ||= []).push(...rows);
  }
  return out;
}

export class Highscores {
  constructor(store = globalThis.localStorage, key = KEY) {
    this.store = store;
    this.key = key;
    this.tables = this.read();
  }

  read() {
    try {
      const raw = this.store?.getItem(this.key);
      if (!raw) return empty();
      return merge(empty(), JSON.parse(raw));
    } catch {
      // Unreadable, or storage turned off. An empty board is the right answer:
      // losing the board is a shame, refusing to start the game is worse.
      return empty();
    }
  }

  write() {
    try {
      this.store?.setItem(this.key, JSON.stringify(this.tables));
    } catch { /* private mode: the board just will not stick */ }
  }

  table(mode, route, tier) {
    return this.tables[levelOf(mode, route, tier)] || [];
  }

  qualifies(mode, route, tier, entry) {
    return qualifies(this.table(mode, route, tier), entry);
  }

  /** Adds a run and returns where it landed, or 0 if it missed the board. */
  add(mode, route, tier, entry) {
    const clean = cleanEntry(entry);
    if (!clean) return 0;
    const level = levelOf(mode, route, tier);
    this.tables[level] = sortTable([...this.table(level), clean]);
    this.write();
    return this.tables[level].findIndex((r) => r.id === clean.id) + 1;
  }

  /** The best anybody has done on a list, for showing in the menu. */
  best(mode, route, tier) {
    return this.table(mode, route, tier)[0] || null;
  }

  /** Folds in a board from somewhere else and keeps the result. */
  absorb(theirs) {
    this.tables = merge(this.tables, theirs);
    this.write();
    return this.tables;
  }

  all() {
    return this.tables;
  }
}
