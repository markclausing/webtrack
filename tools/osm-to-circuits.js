// Turns what tools/import-osm.js measured into the block that goes in
// src/game/circuits.js.
//
//   node tools/import-osm.js monaco        # writes osm-circuits.json
//   node tools/osm-to-circuits.js monaco   # prints the entry
//
// Held apart from the importer because the importer talks to the network and
// this does not: re-running the packing after changing how a building is stored
// should not mean asking Overpass for Monaco again.

import { readFileSync } from 'node:fs';

const src = JSON.parse(readFileSync('osm-circuits.json', 'utf8'));
const key = process.argv[2];
const found = src.find((c) => c.key === key);
if (!found) {
  console.error(`no ${key} in osm-circuits.json (has ${src.map((c) => c.key).join(', ')})`);
  process.exit(1);
}

/** Buildings, as one string: six numbers each, base 36, no separators wasted. */
function packBuildings(list) {
  return list.map((b) => [
    b.at, b.side > 0 ? 1 : 0, Math.round(b.off), b.w, b.d, b.h,
    Math.round(((b.r % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) * 100),
  ].map((n) => n.toString(36)).join(',')).join(' ');
}

function packBoats(list) {
  return list.map((b) => [
    b.at, b.side > 0 ? 1 : 0, Math.round(b.off), Math.round(b.s * 10),
    Math.round(((b.r % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) * 100),
  ].map((n) => n.toString(36)).join(',')).join(' ');
}

const out = {
  metres: Math.round(found.metres),
  line: found.line,
  height: found.height,
  tunnel: found.tunnel,
  buildings: packBuildings(found.buildings),
  boats: packBoats(found.boats),
};
console.error(`${key}: ${Math.round(found.metres)} m, `
  + `${found.tunnel.split('').filter((c) => c === '1').length * 10} m of tunnel, `
  + `${found.buildings.length} buildings, ${found.boats.length} boats`);
for (const [name, value] of Object.entries(out)) {
  if (typeof value === 'number') console.log(`    ${name}: ${value},`);
  else console.log(`    ${name}: '${value}',`);
}
