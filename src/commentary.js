/**
 * The handful of words this game knows how to say.
 *
 * The synthesiser in speech.js is shared with websoccer, webtennis, webracing
 * and webtype and knows nothing about any of them - it is given phonemes and it
 * says them. This is this game's half: a vocabulary of about twenty words and a
 * rule about when to use them.
 *
 * The rule is that it only speaks when the sound effects cannot. A punch is a
 * punch and needs no announcement; a checkpoint is forty-eight seconds arriving
 * at a hundred and eighty miles an hour, and by the time you have found the
 * number on the screen it has scrolled past. Four events, then, and no others,
 * because a voice that narrated a fight would be a voice everybody turns off in
 * the menu inside a minute.
 *
 * Spelled out in phonemes rather than letters because the synthesiser has no
 * pronunciation rules and is not getting any: "checkpoint" is nine sounds and
 * writing them down is quicker than teaching a machine English.
 */

export const WORDS = {
  check: ['CH', 'EH', 'K'],
  point: ['P', 'OY', 'N', 'T'],
  checkpoint: ['CH', 'EH', 'K', 'P', 'OY', 'N', 'T'],
  time: ['T', 'AY', 'M'],
  up: ['AH', 'P'],
  out: ['AW', 'T'],
  of: ['AH', 'V'],
  get: ['G', 'EH', 'T'],
  busted: ['B', 'AH', 'S', 'T', 'IH', 'D'],
  police: ['P', 'AH', 'L', 'IY', 'S'],
  down: ['D', 'AW', 'N'],
  new: ['N', 'UW'],
  record: ['R', 'EH', 'K', 'ER', 'D'],
  nice: ['N', 'AY', 'S'],
  one: ['W', 'AH', 'N'],
  go: ['G', 'OW'],
  ride: ['R', 'AY', 'D'],
  behind: ['B', 'IH', 'HH', 'AY', 'N', 'D'],
  you: ['Y', 'UW'],
  are: ['AA', 'R'],
  finish: ['F', 'IH', 'N', 'IH', 'SH'],
};

/**
 * Lines per event, several each.
 *
 * Taken in turn rather than at random by the synthesiser, so that three
 * checkpoints in a row are not the same word three times - which is the thing
 * that makes a speaking game sound broken rather than sound like a game.
 */
export const LINES = {
  check: ['checkpoint', 'check point', 'go go'],
  law: ['police', 'police behind you'],
  down: ['get up', 'get up ride'],
  over: ['out of time', 'time up'],
  busted: ['busted', 'you are busted'],
  record: ['new record', 'nice one'],
  finish: ['finish', 'nice one'],
};

/**
 * OY is not in the synthesiser's table, and there is no reason for it to be for
 * one word. A diphthong that is missing simply does not sound, which would make
 * "checkpoint" come out as "checkpnt" - so it is spelled the long way round
 * here rather than by adding a phoneme five games share.
 */
for (const word of Object.values(WORDS)) {
  for (let i = 0; i < word.length; i++) {
    if (word[i] === 'OY') word.splice(i, 1, 'AO', 'IH');
  }
}
