/**
 * The handful of words this game knows how to say.
 *
 * The synthesiser in speech.js is shared with websoccer, webtennis, webracing
 * and webtype and knows nothing about any of them - it is given phonemes and it
 * says them. This is this game's half: a vocabulary of about twenty words and a
 * rule about when to use them.
 *
 * The rule is that it only speaks when nothing else can. The engine says how
 * fast you are going, the rev counter says when to change, and the position in
 * the corner of the screen says where you are - so there are four things left
 * worth saying out loud, and a voice that said any more than that would be a
 * voice everybody turns off in the menu inside a lap.
 *
 * Spelled out in phonemes rather than letters because the synthesiser has no
 * pronunciation rules and is not getting any: "checkpoint" is nine sounds and
 * writing them down is quicker than teaching a machine English.
 */

export const WORDS = {
  check: ['CH', 'EH', 'K'],
  point: ['P', 'AO', 'IH', 'N', 'T'],
  checkpoint: ['CH', 'EH', 'K', 'P', 'AO', 'IH', 'N', 'T'],
  green: ['G', 'R', 'IY', 'N'],
  light: ['L', 'AY', 'T'],
  go: ['G', 'OW'],
  time: ['T', 'AY', 'M'],
  up: ['AH', 'P'],
  out: ['AW', 'T'],
  of: ['AH', 'V'],
  first: ['F', 'ER', 'S', 'T'],
  place: ['P', 'L', 'EY', 'S'],
  nice: ['N', 'AY', 'S'],
  one: ['W', 'AH', 'N'],
  well: ['W', 'EH', 'L'],
  done: ['D', 'AH', 'N'],
  finish: ['F', 'IH', 'N', 'IH', 'SH'],
  win: ['W', 'IH', 'N'],
  the: ['DH', 'AH'],
  you: ['Y', 'UW'],
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
  green: ['green light', 'go'],
  over: ['out of time', 'time up'],
  finish: ['finish', 'well done'],
  won: ['first place', 'you win', 'nice one'],
};
