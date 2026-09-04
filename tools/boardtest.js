// What the score board says out loud, checked without a network anywhere near it.
//
//   node tools/boardtest.js
//
// announce.js was written to be testable - it is held apart from the Worker so
// that both servers can use it and so the wording can be checked on its own -
// and then never was. This is that. It matters more than it looks: the Worker
// posts into a Discord channel shared with four other games, so a message that
// forgets to say which game it came from, or that fires for a run that did not
// make the board, or that fires twice for the same run arriving from a second
// device, is a message somebody has to go and delete.

import { announcement, GAME_URL, newRows, time } from '../worker/announce.js';
import { merge } from '../src/highscores.js';

let failures = 0;
function ok(what, passed) {
  if (!passed) failures++;
  console.log(`  ${passed ? 'ok  ' : 'FAIL'} ${what}`);
}

const row = (id, name, t, extra = {}) => ({
  id, name, time: t, place: 1, metres: 4270, at: Date.now(), ...extra,
});

// --- Ticks into something a person reads ------------------------------------------

ok(`a lap of 4073 ticks reads as ${time(4073)}`, time(4073) === '1:07.88');
ok('and nothing at all reads as 0:00.00', time(0) === '0:00.00');
ok('and rubbish does not throw', time(undefined) === '0:00.00' && time(-5) === '0:00.00');

// --- What counts as news ----------------------------------------------------------

{
  const before = merge({}, { 'qual:pass:normal': [row('a', 'MJC', 4100)] });
  const after = merge({}, {
    'qual:pass:normal': [row('b', 'ANA', 4050), row('a', 'MJC', 4100)],
  });
  const news = newRows(before, after);
  ok('a quicker time from somebody else is news', news.length === 1 && news[0].entry.id === 'b');
  ok('and it knows where it landed', news[0].place === 1 && news[0].level === 'qual:pass:normal');
}

{
  // The same run, arriving again from a second device. Matched by id, so it is
  // the same run and not a second one.
  const board = merge({}, { 'gp:spa:hard': [row('a', 'MJC', 7000)] });
  ok('the same run arriving twice is not news', newRows(board, board).length === 0);
}

{
  const before = merge({}, {
    'qual:monza:normal': Array.from({ length: 10 }, (_, i) => row(`x${i}`, 'AAA', 5000 + i)),
  });
  const after = merge({}, {
    'qual:monza:normal': [
      ...Array.from({ length: 10 }, (_, i) => row(`x${i}`, 'AAA', 5000 + i)),
      row('slow', 'ZZZ', 9999),
    ],
  });
  ok('a run that missed the board is not news', newRows(before, after).length === 0);
}

{
  // Two at once, and the better one first so a post that has to cut something
  // cuts the least interesting line.
  const after = merge({}, {
    'qual:pass:normal': [row('win', 'AAA', 4000)],
    'gp:spa:normal': [row('mid', 'BBB', 7000), row('x', 'CCC', 6000)],
  });
  const news = newRows({}, after);
  ok('several at once come back best placing first',
    news.length === 3 && news[0].place === 1 && news[news.length - 1].place === 2);
}

// --- The message itself -----------------------------------------------------------

{
  const post = announcement(newRows({}, merge({}, {
    'qual:zandvoort:hard': [row('a', 'MJC', 4930)],
  })));
  const body = post.embeds[0].description;
  ok('it says which game it is', post.username === 'WebTrack'
    && post.embeds[0].title.includes('WebTrack'));
  ok('it says who, what and where', body.includes('MJC') && body.includes('1:22.16')
    && body.includes('Zandvoort'));
  ok('and on which setting, when it is not the middle one', body.includes('HARD'));
  ok('it links to the game', post.embeds[0].url === GAME_URL);
  ok('and it cannot ping a whole server',
    JSON.stringify(post.allowed_mentions.parse) === '[]');
}

{
  const post = announcement(newRows({}, merge({}, {
    'gp:suzuka:normal': [row('a', 'MJC', 6200, { place: 1 })],
  })));
  const body = post.embeds[0].description;
  ok('a race says it was a race, and that it was won',
    body.includes('raced') && body.includes('Suzuka') && body.includes('won it'));
  ok('and says nothing about the middle setting', !body.includes('NORMAL'));
}

{
  const many = Array.from({ length: 7 }, (_, i) => ({
    entry: row(`r${i}`, 'MJC', 5000 + i), level: 'qual:spa:normal', place: i + 1,
  }));
  const body = announcement(many).embeds[0].description;
  ok('a flood is three lines and a count',
    body.split('\n').length === 4 && body.includes('…and 4 more.'));
}

{
  const post = announcement(newRows({}, merge({}, {
    'qual:pass:normal': [row('a', 'MJC', 4100)],
  })), 'https://example.test/track/');
  ok('and it can be hosted somewhere else', post.embeds[0].url === 'https://example.test/track/'
    && post.embeds[0].footer.text.includes('example.test/track'));
}

console.log(failures ? `\n${failures} failed` : '\nall good');
process.exit(failures ? 1 : 0);
