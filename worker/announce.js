/**
 * What gets said in Discord when somebody puts a time on the board.
 *
 * Kept apart from the Worker so both servers can use it and so the wording can
 * be tested without a network anywhere near it. Nothing in here talks to
 * Discord; it only decides what is news and what the message should say.
 *
 * It says which game is talking, and that is not decoration. All five games post
 * into the same channel - the webhook is only an address and does not care who
 * is using it - so a bare "MJC 3:41.20" would be indistinguishable from
 * webracing's lap times to anybody who was not already playing.
 */

import { LEVELS, partsOf } from '../src/highscores.js';

/** How many times one post will mention before it just counts the rest. */
const MAX_LINES = 3;

const ROADS = {
  pass: 'the pass',
  coast: 'the boulevard',
  grand: 'the grand circuit',
};

const PLACED = {
  1: ', and won it',
  2: ', second',
  3: ', third',
};

const AGAINST = {
  easy: ' on EASY',
  normal: '',
  hard: ' on HARD',
};

/** Ticks into `3:41.20`, the same shape the game puts on the screen. */
export function time(ticks) {
  const total = Math.max(0, Number(ticks) || 0) / 60;
  const m = Math.floor(total / 60);
  const s = Math.floor(total % 60);
  const h = Math.floor((total * 100) % 100);
  return `${m}:${String(s).padStart(2, '0')}.${String(h).padStart(2, '0')}`;
}

/**
 * Which rows are new, and where they landed.
 *
 * Worked out by comparing the board before and after rather than trusting what
 * was sent: a run that did not make the top ten is not news, and the same run
 * arriving from a second device is not news either, because merging matches it
 * by id.
 */
export function newRows(before, after) {
  const rows = [];
  for (const level of LEVELS) {
    const had = new Set((before?.[level] || []).map((r) => r.id));
    const now = after?.[level] || [];
    for (let i = 0; i < now.length; i++) {
      if (!had.has(now[i].id)) rows.push({ entry: now[i], level, place: i + 1 });
    }
  }
  // Best placings first, so a post that has to cut something cuts the least
  // interesting line.
  return rows.sort((a, b) => a.place - b.place);
}

function ordinal(n) {
  if (n === 1) return '**top of the board**';
  if (n === 2) return 'second';
  if (n === 3) return 'third';
  return `number ${n}`;
}

function line({ entry, level, place }) {
  const parts = partsOf(level);
  if (parts.mode === 'qual') {
    return `🏎️ **${entry.name}** put a **${time(entry.time)}** lap on `
      + `${ROADS[parts.route] || 'the circuit'}${AGAINST[parts.tier] ?? ''} — ${ordinal(place)}`;
  }
  const placed = PLACED[entry.place] ?? (entry.place < 90 ? `, ${entry.place}th` : '');
  return `🏎️ **${entry.name}** raced ${ROADS[parts.route] || 'the circuit'} in `
    + `**${time(entry.time)}**${AGAINST[parts.tier] ?? ''}${placed} — ${ordinal(place)}`;
}

/**
 * Where the game lives. Overridden with a GAME_URL variable if you host it
 * somewhere else, because the whole point of the message is that people can
 * click it and go and beat the time.
 */
export const GAME_URL = 'https://markclausing.github.io/webtrack/';

/** The sodium orange the menu is written in. */
const COLOUR = 0xff8a3d;

/**
 * The body of the Discord post.
 *
 * An embed rather than a line of text: it gives the message a clickable title,
 * so nobody has to copy an address out of a chat window, and it says which game
 * this is. The name is set on the message as well, so it reads as WebTrack
 * talking whatever the webhook itself was called when it was made.
 */
export function announcement(rows, gameUrl = GAME_URL) {
  const shown = rows.slice(0, MAX_LINES).map(line);
  if (rows.length > MAX_LINES) {
    shown.push(`…and ${rows.length - MAX_LINES} more.`);
  }
  const url = gameUrl || GAME_URL;
  const plural = rows.length > 1 ? 'New times' : 'A new time';
  return {
    username: 'WebTrack',
    embeds: [{
      title: `🏎️ ${plural} in WebTrack`,
      url,
      description: shown.join('\n'),
      color: COLOUR,
      footer: { text: `Play at ${url.replace(/^https?:\/\//, '').replace(/\/$/, '')}` },
    }],
    // Names are three characters of A-Z, 0-9 and a dash, so they cannot spell a
    // mention - but a board this open should not be one webhook away from
    // pinging a whole server, whatever anybody changes later.
    allowed_mentions: { parse: [] },
  };
}
