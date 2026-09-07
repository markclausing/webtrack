// The development server: the static files, and the score board behind them.
//
//   npm start        # http://localhost:8080
//
// This exists so the shared half of the game can be worked on without deploying
// anything. It speaks exactly the two calls the Cloudflare Worker next door
// speaks - GET /highscores and POST /highscores - so the browser cannot tell the
// difference, and neither can the tests. In production it is the Worker that
// runs; this is here because "deploy it and see" is a terrible way to find out
// that a board merge was wrong.
//
// The board is kept in highscores.json beside the repository, which is in
// .gitignore. Losing it costs a development board and nothing else.

import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cleanGhost } from '../src/game/ghost.js';
import { merge } from '../src/highscores.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const STORE = path.join(ROOT, 'highscores.json');
const PORT = Number(process.env.PORT) || 8080;
const MAX_BODY = 64 * 1024;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

let board = null;

async function load() {
  if (board) return board;
  try {
    board = merge({}, JSON.parse(await readFile(STORE, 'utf8')));
  } catch {
    board = merge({}, {});
  }
  return board;
}

async function save() {
  try {
    await writeFile(STORE, JSON.stringify(board, null, 2));
  } catch (err) {
    console.error('could not write the board:', err.message);
  }
}

const json = (res, body, status = 200) => {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'access-control-allow-headers': 'content-type',
  });
  res.end(JSON.stringify(body));
};

async function scores(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, { 'access-control-allow-origin': '*' });
    res.end();
    return;
  }
  if (req.method === 'GET') {
    json(res, { board: await load() });
    return;
  }
  if (req.method !== 'POST') {
    json(res, { error: 'GET to read the board, POST to add to it' }, 405);
    return;
  }

  let text = '';
  for await (const chunk of req) {
    text += chunk;
    if (text.length > MAX_BODY) {
      json(res, { error: 'that is not a score board' }, 413);
      return;
    }
  }
  let sent;
  try {
    sent = JSON.parse(text);
  } catch {
    json(res, { error: 'not JSON' }, 400);
    return;
  }
  // The same merge the browser runs, so the two cannot disagree about what a
  // board is: rows that are not a plausible time do not survive it.
  const before = await load();
  board = merge(before, sent?.board || {});
  if (JSON.stringify(board) !== JSON.stringify(before)) await save();
  json(res, { board });
}

async function statics(req, res) {
  const asked = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const rel = asked === '/' ? 'index.html' : asked.replace(/^\/+/, '');
  const file = path.join(ROOT, rel);
  // Nothing outside the repository, whatever the path says.
  if (!file.startsWith(ROOT) || !existsSync(file)) {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('not here');
    return;
  }
  const body = await readFile(file);
  res.writeHead(200, {
    'content-type': TYPES[path.extname(file)] || 'application/octet-stream',
    'cache-control': 'no-cache',
  });
  res.end(body);
}

/**
 * The same two calls the Worker answers, so a browser cannot tell which of them
 * it is talking to. Kept in a file next to the board, one recorded lap per list.
 */
const GHOSTS = path.join(ROOT, 'ghosts.json');
let ghosts = null;

async function loadGhosts() {
  if (!ghosts) {
    try {
      ghosts = JSON.parse(await readFile(GHOSTS, 'utf8'));
    } catch {
      ghosts = {};
    }
  }
  return ghosts;
}

async function ghost(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, { 'access-control-allow-origin': '*' });
    res.end();
    return;
  }
  const level = new URL(req.url, 'http://x').searchParams.get('level') || '';
  if (!/^[a-z]+:[a-z]+:[a-z]+$/.test(level)) {
    json(res, { error: 'which list?' }, 400);
    return;
  }
  const all = await loadGhosts();
  if (req.method === 'GET') {
    json(res, all[level] || null);
    return;
  }
  if (req.method !== 'POST') {
    json(res, { error: 'GET to fetch a lap, POST to set one' }, 405);
    return;
  }
  let text = '';
  for await (const chunk of req) {
    text += chunk;
    if (text.length > 24 * 1024) {
      json(res, { error: 'that is not a lap' }, 413);
      return;
    }
  }
  let sent;
  try {
    sent = JSON.parse(text);
  } catch {
    json(res, { error: 'not JSON' }, 400);
    return;
  }
  const lap = cleanGhost(sent);
  if (!lap) {
    json(res, { error: 'that is not a lap' }, 400);
    return;
  }
  const had = all[level];
  if (!had || had.nodes !== lap.nodes || had.time > lap.time) {
    all[level] = lap;
    await writeFile(GHOSTS, JSON.stringify(all));
  }
  json(res, all[level]);
}

createServer((req, res) => {
  if (req.url.startsWith('/ghost')) {
    ghost(req, res).catch(() => json(res, { error: 'server' }, 500));
    return;
  }
  if (req.url.startsWith('/highscores')) {
    scores(req, res).catch(() => json(res, { error: 'server' }, 500));
    return;
  }
  statics(req, res).catch(() => {
    res.writeHead(500);
    res.end('server');
  });
}).listen(PORT, () => {
  console.log(`webtrack on http://localhost:${PORT}`);
});
