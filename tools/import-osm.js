/**
 * A circuit out of OpenStreetMap, with real heights and real tunnels.
 *
 *   node tools/import-osm.js monaco            # one
 *   node tools/import-osm.js all               # every one it knows
 *
 * The other sixteen circuits in this game came from a survey that hands you a
 * centre line and nothing else: no height, no tunnels, no idea what is beside
 * the road. Everything except the corners had to be written by hand, and the
 * writing was honest but it was writing.
 *
 * This is the other way round. OpenStreetMap knows where the road is, whether it
 * is in a tunnel, and what buildings stand beside it; an elevation service knows
 * how high each point of it is. So the parts of a circuit that used to be
 * authored are measured here, and what is left to invent is only the parts
 * nobody has measured.
 *
 * Three things make it awkward, and all three are handled:
 *
 * 1. **A circuit is mapped three different ways.** A permanent one is a set of
 *    `highway=raceway` ways. Some are a route relation instead. A street circuit
 *    is neither: it is public road for fifty weeks of the year, so only the bits
 *    that are *only* ever circuit - Monaco's tunnel, its swimming pool section -
 *    carry the raceway tag, and the rest is the town. Monaco comes out at 31 per
 *    cent covered, Baku at 15.
 *
 * 2. **So the gaps have to be driven.** Where the raceway fragments do not meet,
 *    this routes between them along the ordinary street graph, which for a
 *    street circuit is the road the circuit actually uses because there is only
 *    one road there.
 *
 * 3. **Height is noisy.** The elevation service is sampling a terrain model
 *    every thirty metres or so, and a road cut into a hillside is not the
 *    hillside. Raw, it gives a surface that shakes the car to pieces; smoothed
 *    over a couple of hundred metres it gives the shape of the climb, which is
 *    the part that is true.
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const CACHE = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.osm-cache');

const OVERPASS = 'https://overpass-api.de/api/interpreter';
/**
 * Two elevation services, because one of them will be having a day.
 *
 * Both are free and both rate limit, and they limit differently: Open-Meteo
 * counts requests an hour, Open Topo Data counts them a day. Importing eight
 * circuits at six hundred points each is enough to find the edge of either, so
 * this asks the first, and asks the second when the first says no.
 */
const ELEVATION = [
  {
    // Asked first, and not only because it was written first: it is on a better
    // terrain model. Over Monaco it reports forty-one metres between the harbour
    // and Casino, which is what Monaco has; the SRTM below reports twenty-one,
    // because thirty metre SRTM in a town that dense is looking at roofs. So a
    // circuit imported on the fallback has a real but flattened profile, and it
    // is worth re-running it later rather than keeping that.
    name: 'open-meteo',
    url: (pts) => 'https://api.open-meteo.com/v1/elevation'
      + `?latitude=${pts.map((p) => p.lat.toFixed(5)).join(',')}`
      + `&longitude=${pts.map((p) => p.lon.toFixed(5)).join(',')}`,
    read: (d) => d.elevation,
  },
  {
    name: 'opentopodata',
    url: (pts) => 'https://api.opentopodata.org/v1/srtm30m?locations='
      + pts.map((p) => `${p.lat.toFixed(5)},${p.lon.toFixed(5)}`).join('|'),
    read: (d) => d.results.map((r) => r.elevation),
  },
];

/**
 * Where each circuit is and how it is mapped.
 *
 * `metres` is the published lap length and is used only to report how much of
 * the circuit was found - it is a check on the import, never an input to it.
 */
const CIRCUITS = {
  monaco: {
    box: [43.72, 7.40, 43.75, 7.44], metres: 3337,
    name: 'Circuit de Monaco', route: true, clockwise: true,
  },
  jeddah: { box: [21.55, 39.05, 21.70, 39.20], metres: 6174, name: 'حلبة كورنيش جدة' },
  miami: {
    box: [25.94, -80.26, 25.99, -80.21], metres: 5412,
    name: 'Miami International Autodrome',
  },
  vegas: { box: [36.09, -115.19, 36.13, -115.14], metres: 6201, relation: 16696508 },
  singapore: { box: [1.285, 103.855, 1.300, 103.870], metres: 4940, route: true },
  madrid: { box: [40.40, -3.63, 40.48, -3.56], metres: 5474, relation: 18813472 },
  baku: { box: [40.36, 49.82, 40.40, 49.87], metres: 6003, route: true },
  losail: {
    box: [25.46, 51.42, 25.52, 51.48], metres: 5419,
    name: 'Lusail International Circuit',
  },
};

async function overpass(query) {
  // Form encoded, and with a name on it. Overpass refuses anything from Node's
  // fetch with a 406 and no explanation until it is told who is asking - which
  // is a reasonable thing for a free public service to insist on, and takes an
  // hour to work out, because curl sends a User-Agent by itself and so the same
  // query works from the shell and not from here.
  /**
   * Answers are kept on disk, keyed by the query.
   *
   * Overpass is free and public and asks, politely and in its documentation, not
   * to be hammered - and tuning the assembly means running the same eight
   * queries over and over, which has nothing to do with the map and everything
   * to do with the code downstream of it. Cached, the second run costs nothing
   * and the service is left alone. Delete `.osm-cache` to fetch again.
   */
  const key = createHash('sha1').update(query).digest('hex').slice(0, 16);
  const file = path.join(CACHE, `${key}.json`);
  if (existsSync(file)) return JSON.parse(readFileSync(file, 'utf8'));

  const res = await fetch(OVERPASS, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'webtrack-circuit-import/1.0 (https://github.com/markclausing/webtrack)',
    },
    body: `data=${encodeURIComponent(query)}`,
  });
  if (!res.ok) throw new Error(`overpass ${res.status}`);
  const json = await res.json();
  mkdirSync(CACHE, { recursive: true });
  writeFileSync(file, JSON.stringify(json));
  return json;
}

/** Metres per degree, about a given latitude. A circuit is small enough for flat earth. */
function projector(lat0, lon0) {
  const R = 6371000;
  const k = Math.cos((lat0 * Math.PI) / 180);
  return (lat, lon) => ({
    x: ((lon - lon0) * Math.PI / 180) * R * k,
    z: ((lat - lat0) * Math.PI / 180) * R,
  });
}

const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

// --- Getting the road out of the map ------------------------------------------

/**
 * The buildings and the water beside a circuit.
 *
 * Half of these eight are street circuits, and a street circuit without the
 * street is a road through a field. What is beside the road at Monaco is Monaco,
 * and OpenStreetMap knows where every building of it stands, how big its
 * footprint is and - often - how many floors it has. That is a better set of
 * buildings than anybody would place by hand, and it is the same argument as the
 * tunnel: the map already knows.
 */
async function fetchScenery(circuit) {
  const [a, b, c, d] = circuit.box;
  const bbox = `${a},${b},${c},${d}`;
  const query = `[out:json][timeout:180];
(
  way["building"](${bbox});
  way["natural"="water"](${bbox});
  way["landuse"="harbour"](${bbox});
  way["waterway"="dock"](${bbox});
  way["man_made"="pier"](${bbox});
);
out geom;`;
  const data = await overpass(query);
  const buildings = [];
  const water = [];
  const piers = [];
  for (const e of data.elements) {
    const g = e.geometry;
    if (!g || g.length < 3) continue;
    const t = e.tags || {};
    if (t.building) buildings.push({ g, tags: t });
    else if (t.man_made === 'pier') piers.push({ g, tags: t });
    else water.push({ g, tags: t });
  }
  return { buildings, water, piers };
}

/** Everything in the box that a car could be driven along, plus the raceway. */
async function fetchRoads(circuit) {
  const [a, b, c, d] = circuit.box;
  const bbox = `${a},${b},${c},${d}`;
  const relation = circuit.relation ? `relation(${circuit.relation});>>;` : '';
  const query = `[out:json][timeout:180];
(
  way["highway"="raceway"](${bbox});
  ${relation}
  way["highway"~"^(motorway|trunk|primary|secondary|tertiary|unclassified|residential|service|motorway_link|trunk_link|primary_link|secondary_link|tertiary_link)$"](${bbox});
);
out body;
>;
out skel qt;`;
  const data = await overpass(query);
  const nodes = new Map();
  const ways = [];
  for (const e of data.elements) {
    if (e.type === 'node') nodes.set(e.id, { lat: e.lat, lon: e.lon });
    else if (e.type === 'way' && e.nodes) ways.push(e);
  }
  return { nodes, ways };
}

/** Is this way part of the circuit itself, rather than of the town around it? */
function isCircuit(way, circuit, members) {
  const t = way.tags || {};
  if (t.highway !== 'raceway') return false;
  // Pit lanes, pit entries, penalty loops and alternative layouts are all
  // tagged raceway and none of them is the lap.
  //
  // Checked before the relation membership below, not after. It used to be
  // after, on the reasoning that a circuit which names its own ways knows best -
  // and Madrid's relation contains a way called "Madring pit lane", which sailed
  // straight past this and into the lap.
  const name = `${t.name || ''}`.toLowerCase();
  if (/pit|stands|paddock|box|penalty|entry|exit|drag|karting|oval|inner|outer/.test(name)) {
    return false;
  }
  if (members && members.has(way.id)) return true;
  if (t.service || t.area === 'yes') return false;
  // A circuit with several layouts mapped has them named; if this one told us
  // its name, anything else in the box is somebody else's lap.
  if (circuit.name) return t.name === circuit.name;
  return true;
}

/**
 * Ways joined into the longest runs their shared nodes allow.
 *
 * Joined on node id rather than on position, which is exact: two ways that meet
 * in OpenStreetMap share the node, and comparing coordinates instead means
 * choosing a rounding and getting it wrong.
 */
function chain(ways) {
  const runs = ways.map((w) => ({ nodes: [...w.nodes], tunnel: (w.tags || {}).tunnel === 'yes' }));
  let joined = true;
  while (joined) {
    joined = false;
    outer:
    for (let i = 0; i < runs.length; i++) {
      for (let j = i + 1; j < runs.length; j++) {
        const A = runs[i];
        const B = runs[j];
        const ends = [
          [A.nodes[A.nodes.length - 1], B.nodes[0], () => A.nodes.push(...B.nodes.slice(1))],
          [A.nodes[A.nodes.length - 1], B.nodes[B.nodes.length - 1],
            () => A.nodes.push(...B.nodes.slice(0, -1).reverse())],
          [A.nodes[0], B.nodes[B.nodes.length - 1],
            () => A.nodes.unshift(...B.nodes.slice(0, -1))],
          [A.nodes[0], B.nodes[0], () => A.nodes.unshift(...B.nodes.slice(1).reverse())],
        ];
        for (const [p, q, join] of ends) {
          if (p !== q) continue;
          join();
          // A run is a tunnel if any of it was; the flag is carried per node
          // later, so this is only used for reporting.
          A.tunnel = A.tunnel || B.tunnel;
          runs.splice(j, 1);
          joined = true;
          break outer;
        }
      }
    }
  }
  return runs;
}

/**
 * Which nodes lie in a tunnel.
 *
 * Read off every way in the box rather than off the circuit's own, and that is
 * the whole trick. Monaco's tunnel is six hundred metres long and only eighteen
 * of them carry the raceway tag: the rest of it is Avenue Kennedy, which is a
 * road in a tunnel that happens to be a circuit for one weekend a year. Asking
 * the circuit gave four points of tunnel out of sixty.
 */
function tunnelNodes(ways) {
  const inTunnel = new Set();
  for (const w of ways) {
    if ((w.tags || {}).tunnel !== 'yes') continue;
    for (const n of w.nodes) inTunnel.add(n);
  }
  return inTunnel;
}

/**
 * The drivable street graph, for filling the gaps between raceway fragments.
 *
 * A street circuit is public road for fifty weeks of the year, so only the parts
 * that are never anything else carry the raceway tag. Monaco has thirty-one per
 * cent of itself mapped that way and Baku fifteen. The rest is the town, and the
 * town is in here.
 */
function graphOf(ways, nodes, project) {
  const links = new Map();
  const add = (a, b, w) => {
    if (!links.has(a)) links.set(a, []);
    links.get(a).push([b, w]);
  };
  for (const way of ways) {
    const ns = way.nodes.filter((n) => nodes.has(n));
    for (let i = 0; i < ns.length - 1; i++) {
      const p = nodes.get(ns[i]);
      const q = nodes.get(ns[i + 1]);
      const w = dist(project(p.lat, p.lon), project(q.lat, q.lon));
      add(ns[i], ns[i + 1], w);
      // Both directions. Oneway is respected on a real road and is not respected
      // here: a circuit that runs the wrong way up a street for one weekend a
      // year is exactly the case this exists for.
      add(ns[i + 1], ns[i], w);
    }
  }
  return links;
}

/**
 * Dijkstra, with a strong dislike of road the lap has already used.
 *
 * The plain shortest path is the wrong answer here and it took a picture to see
 * why. A lap does not use a piece of road twice, and nothing in a shortest-path
 * search knows that: on Monaco's waterfront the graph offers a way out and a way
 * back that are the same street, so the router took both and a hundred and seven
 * of the circuit's nodes ended up with another piece of the same road within a
 * few metres of them, twenty-five metres above or below. From the car that is a
 * length of road hanging in mid-air beside you.
 *
 * `taken` is what the lap has so far, as a grid of positions. Reusing a node is
 * refused outright and passing close to one is charged twenty times the distance
 * - a penalty rather than a ban, because a street circuit does sometimes run
 * alongside itself for a few metres and a ban would simply find no route at all.
 * It has to be spatial and not by node id: the road above Monaco's tunnel and
 * the tunnel are two different ways in the map and the same place on the ground.
 */
function shortest(links, from, to, taken) {
  const near = (a, b) => (taken ? taken.near(a, b) : 0);
  const seen = new Map([[from, 0]]);
  const back = new Map();
  const queue = [[0, from]];
  while (queue.length) {
    queue.sort((a, b) => a[0] - b[0]);
    const [cost, at] = queue.shift();
    if (at === to) break;
    if (cost > (seen.get(at) ?? Infinity)) continue;
    for (const [next, w] of links.get(at) || []) {
      // The target is always allowed - it is a fragment end, and every leg ends
      // on one.
      if (taken && next !== to && taken.has(next)) continue;
      // And a tunnel is never charged for being near anything, for the same
      // reason: it is below whatever it is near.
      const under = taken && taken.tunnel && (taken.tunnel.has(at) || taken.tunnel.has(next));
      const c = cost + w * (1 + (under ? 0 : 20 * near(at, next)));
      if (c >= (seen.get(next) ?? Infinity)) continue;
      seen.set(next, c);
      back.set(next, at);
      queue.push([c, next]);
    }
  }
  if (!seen.has(to)) return null;
  const path = [to];
  while (path[0] !== from) {
    const prev = back.get(path[0]);
    if (prev === undefined) return null;
    path.unshift(prev);
  }
  return path;
}

// --- One lap, out of fragments ------------------------------------------------

/**
 * The fragments put in order and the gaps between them driven.
 *
 * Greedy: start with the longest run, then repeatedly take whichever remaining
 * run can be reached soonest along the streets and append the drive to it. With
 * eight or ten fragments and a circuit that is mostly one road, the nearest one
 * is the right one - and where it is not, the reported coverage says so.
 */
function assemble(runs, links, nodes, project, inTunnel, target = 0) {
  /**
   * What the lap has used so far: the nodes by id, and their positions on a
   * twenty metre grid so "is this near something we already drove" is a lookup
   * rather than a search.
   */
  const CELL = 20;
  const taken = {
    ids: new Set(),
    tunnel: inTunnel,
    grid: new Map(),
    key: (x, z) => `${Math.floor(x / CELL)},${Math.floor(z / CELL)}`,
    has(id) { return this.ids.has(id); },
    add(id) {
      const p = nodes.get(id);
      if (!p) return;
      this.ids.add(id);
      // A tunnel is not in the way of anything: it is under it. Left in the
      // index it made the router avoid Monaco's tunnel altogether - the road
      // above is within twelve metres of it, so taking one made the other
      // expensive - and the circuit came back with a third of the tunnel it
      // has. Being under something is the whole point of the tunnel.
      if (inTunnel && inTunnel.has(id)) return;
      const at = project(p.lat, p.lon);
      const k = this.key(at.x, at.z);
      if (!this.grid.has(k)) this.grid.set(k, []);
      this.grid.get(k).push(at);
    },
    /** 1 if the middle of this edge is within twelve metres of the lap so far. */
    near(a, b) {
      const pa = nodes.get(a);
      const pb = nodes.get(b);
      if (!pa || !pb) return 0;
      const x = (project(pa.lat, pa.lon).x + project(pb.lat, pb.lon).x) / 2;
      const z = (project(pa.lat, pa.lon).z + project(pb.lat, pb.lon).z) / 2;
      const cx = Math.floor(x / CELL);
      const cz = Math.floor(z / CELL);
      for (let dz = -1; dz <= 1; dz++) {
        for (let dx = -1; dx <= 1; dx++) {
          for (const p of this.grid.get(`${cx + dx},${cz + dz}`) || []) {
            if (Math.hypot(p.x - x, p.z - z) < 12) return 1;
          }
        }
      }
      return 0;
    },
  };

  const lengthOf = (ns) => {
    let d = 0;
    for (let i = 0; i < ns.length - 1; i++) {
      const a = nodes.get(ns[i]);
      const b = nodes.get(ns[i + 1]);
      if (a && b) d += dist(project(a.lat, a.lon), project(b.lat, b.lon));
    }
    return d;
  };
  /**
   * The fragments in the order the circuit visits them.
   *
   * Three attempts at this, and the first two are worth recording.
   *
   * Nearest-reachable-next is the obvious one and is wrong: two fragments can
   * be close together and still be visited an entire lap apart, so the route
   * doubles back. Sorting them by the angle of their middle about the middle of
   * everything is better - it is what "in order" means on a loop - and is still
   * a guess. On a circuit shaped like Monaco, which wraps a harbour, climbs a
   * hill and comes back through a tunnel, the angular order of six fragments is
   * not the order a car drives them, and it left the lap turning through zero
   * where a closed circuit turns through two pi.
   *
   * So it is not guessed any more. Six fragments have seven hundred and twenty
   * orders and each can be driven either way about, which is forty-six thousand
   * laps - and every one of them can be priced from a table of the distance
   * between each pair of fragment ends, which is twelve shortest-path searches.
   * The cheapest lap wins, and a lap that fails to close does not count.
   *
   * It is a travelling salesman over six cities, which is not a hard problem at
   * six. Above eight the count runs away and it falls back to the angular order,
   * which is what it had.
   */
  // If the fragments already make one closed loop there is nothing to drive:
  // a permanent circuit is mapped end to end and routing it through the streets
  // would only find a way to make it longer.
  if (runs.length === 1 && runs[0].nodes[0] === runs[0].nodes[runs[0].nodes.length - 1]) {
    return { lap: runs[0].nodes.slice(0, -1), driven: 0, stranded: 0 };
  }

  // Every fragment end, and the road between each pair of them. Twelve searches
  // for six fragments, done once, and after that a lap costs nothing to price.
  const ends = [];
  for (const run of runs) {
    ends.push({ run, flip: false, from: run.nodes[0], to: run.nodes[run.nodes.length - 1] });
    ends.push({ run, flip: true, from: run.nodes[run.nodes.length - 1], to: run.nodes[0] });
  }
  /**
   * The heading of a run of nodes at one end of it, pointing outwards.
   *
   * Used to charge a junction that doubles back. The cheapest cycle over the
   * fragments is not necessarily a lap: an out-and-back down a spur is short,
   * and Monaco's shortest cycle had two of them - each contributing a hairpin of
   * about a hundred and eighty degrees, and two hairpins take a lap that turns
   * through two pi and turn it through nought. Which is exactly the number that
   * was wrong.
   */
  const heading = (ns, atEnd) => {
    const i = atEnd ? ns.length - 1 : 0;
    const j = atEnd ? Math.max(0, ns.length - 4) : Math.min(ns.length - 1, 3);
    const a = nodes.get(ns[j]);
    const b = nodes.get(ns[i]);
    if (!a || !b) return 0;
    const pa = project(a.lat, a.lon);
    const pb = project(b.lat, b.lon);
    return Math.atan2(pb.x - pa.x, pb.z - pa.z);
  };

  /**
   * Every fragment is off limits to the connectors before any of them is drawn.
   *
   * The rule that a lap does not drive the same road twice was already here and
   * was doing nothing, because it was applied while assembling and the distances
   * between fragments were worked out before that - so a connector was free to
   * run the length of a fragment it had not reached yet, and did. Five of the
   * eight circuits came back with between thirty-nine and ninety per cent of the
   * lap lying on top of the rest of it, and a net turn of nought, which is what a
   * lap driven out and back reads as.
   *
   * Seeded with all of them up front, a connector has to go round.
   */
  for (const run of runs) for (const id of run.nodes) taken.add(id);

  const legs = new Map();
  const legKey = (a, b) => `${a},${b}`;
  for (const a of ends) {
    for (const b of ends) {
      // A fragment is allowed to be joined to its own far end. That is a lap of
      // one piece, closed by driving from where the fragment stops back to where
      // it starts, and at Miami it is the whole circuit - the other two ways
      // named after the autodrome are half as much road again as the lap has.
      const key = legKey(a.to, b.from);
      if (legs.has(key) || a.to === b.from) continue;
      const path = shortest(links, a.to, b.from, taken);
      if (!path) {
        legs.set(key, null);
        continue;
      }
      // How sharply the road turns where the fragment hands over to the leg,
      // and where the leg hands back. A lap does not hairpin at a junction.
      const bend = (from, to) => {
        let d = to - from;
        while (d > Math.PI) d -= Math.PI * 2;
        while (d < -Math.PI) d += Math.PI * 2;
        return Math.abs(d);
      };
      const out = a.flip ? heading([...a.run.nodes].reverse(), true) : heading(a.run.nodes, true);
      const into = b.flip ? heading([...b.run.nodes].reverse(), false) : heading(b.run.nodes, false);
      const legOut = heading(path, false);
      const legIn = heading(path, true);
      const kink = Math.max(bend(out, legOut), bend(legIn, into));
      // Charged as distance so it competes with length on the same terms, and
      // charged gently.
      //
      // It was five thousand metres for anything past two radians, on the
      // reasoning that a reversal is never worth a detour. That is true and it
      // is not what the number does: at that size the penalty stops competing
      // with length and starts choosing the route on its own, and Monaco came
      // back four kilometres long turning through six pi - three laps of
      // something. Forty metres a radian leaves length in charge and puts a
      // thumb on the scale, which is all that was wanted.
      legs.set(key, { path, cost: lengthOf(path) + kink * 40, real: lengthOf(path) });
    }
  }

  /**
   * A fragment that no street reaches still has to be worth something.
   *
   * Jeddah's raceway is mapped as its own thing, joined to no public road, so
   * every search above came back empty, the table was empty, and the ordering
   * had nothing to compare - it fell through to the angular guess and jumped
   * between fragments in straight lines. The same is true of any circuit inside
   * a fence.
   *
   * So where there is no route, the gap is crossed straight and charged three
   * times its length. That is dear enough that a real road is always taken when
   * there is one, and cheap enough that the search can still tell a good subset
   * of the fragments from a bad one - which is the whole point of having it.
   */
  for (const a of ends) {
    for (const b of ends) {
      const key = legKey(a.to, b.from);
      // A failed search is remembered as null so it is not run twice, which is
      // why this asks for the value and not for the key: `has` is true for the
      // very gaps this loop exists to fill.
      if (legs.get(key) || a.to === b.from) continue;
      const from = nodes.get(a.to);
      const to = nodes.get(b.from);
      if (!from || !to) continue;
      const gap = dist(project(from.lat, from.lon), project(to.lat, to.lon));
      legs.set(key, { path: [a.to, b.from], cost: gap * 3, real: gap, jumped: true });
    }
  }

  /**
   * The lap may close before every fragment has been used.
   *
   * Tags can tell a pit lane from a circuit and cannot do any more than that.
   * Jeddah arrives as nine ways all called حلبة كورنيش جدة and Miami as ten all
   * called Miami International Autodrome, and in both cases that is half again
   * as much road as the lap has - a circuit is mapped with the bits that are
   * only ever raceway, and around a stadium or a corniche that includes access
   * roads and older layouts nobody has retagged. There is nothing left in the
   * tags to choose by.
   *
   * So it is chosen by the one measurement we actually have: how long the lap
   * is. Every closed tour over every subset of the fragments is reachable from
   * this walk, because the order is free and skipping a fragment is the same as
   * closing before it is reached, and each one is scored on how near it comes to
   * the real distance.
   */
  const runLen = new Map(runs.map((r) => [r, lengthOf(r.nodes)]));
  const best = { score: Infinity, cost: Infinity, order: null };

  /**
   * How wrong a candidate lap is, in metres.
   *
   * Length first, because that is the thing we know. The cost is worth a fifth
   * of itself on top, which does not decide between a lap of the right length
   * and one of the wrong length but does decide between two of the right length,
   * and prefers the one that drives less of the town.
   */
  const scoreOf = (metres, cost) => (target ? Math.abs(metres - target) : 0) + cost * 0.2;

  const walk = (chosen, spent, metres, restLeft) => {
    // Both terms only grow from here, so a branch already this far over the
    // real length cannot come back.
    if (scoreOf(metres, spent) - (target ? 0 : 0) >= best.score
      && (!target || metres >= target)) return;
    if (spent >= best.cost && !target) return;

    // Close it here, whatever is left over - including on the first fragment,
    // which is a lap of one piece and is what Miami turns out to be.
    {
      const tail = chosen[chosen.length - 1];
      // Already closed: the fragment ends where the first one began, so there
      // is nothing to drive. This is the ordinary case for a permanent circuit
      // mapped as one loop, and until it was allowed for, every such lap failed
      // to close and fell through to the guess.
      const shut = tail.to === chosen[0].from;
      const home = shut ? { cost: 0, real: 0 } : legs.get(legKey(tail.to, chosen[0].from));
      if (home) {
        const score = scoreOf(metres + (home.real ?? home.cost), spent + home.cost);
        if (score < best.score) {
          best.score = score;
          best.cost = spent + home.cost;
          best.order = [...chosen];
        }
      }
    }

    for (let i = 0; i < restLeft.length; i++) {
      const run = restLeft[i];
      const rest = restLeft.slice(0, i).concat(restLeft.slice(i + 1));
      for (const flip of [false, true]) {
        const next = ends.find((e) => e.run === run && e.flip === flip);
        const leg = legs.get(legKey(chosen[chosen.length - 1].to, next.from));
        if (!leg) continue;
        walk([...chosen, next], spent + leg.cost,
          metres + (leg.real ?? leg.cost) + runLen.get(run), rest);
      }
    }
  };

  /**
   * A first lap, taken greedily, so the search has something to cut against.
   *
   * The walk above abandons a branch the moment it costs more than the best lap
   * found so far, which is worth nothing until a lap has been found - the first
   * complete order costs a full descent. Handing it a nearest-next lap before it
   * starts means the very first branch is already being measured against a real
   * number, and that is what makes eleven fragments affordable where eight was
   * the ceiling before.
   */
  const greedy = () => {
    let at = ends[0];
    const chosen = [at];
    let spent = 0;
    let metres = runLen.get(ends[0].run);
    const left = runs.slice(1);
    while (left.length) {
      let pick = null;
      for (let i = 0; i < left.length; i++) {
        for (const flip of [false, true]) {
          const to = ends.find((e) => e.run === left[i] && e.flip === flip);
          const leg = legs.get(legKey(at.to, to.from));
          if (leg && (!pick || leg.cost < pick.leg.cost)) pick = { i, to, leg };
        }
      }
      if (!pick) break;
      spent += pick.leg.cost;
      metres += (pick.leg.real ?? pick.leg.cost) + runLen.get(pick.to.run);
      at = pick.to;
      chosen.push(at);
      left.splice(pick.i, 1);
    }
    const home = legs.get(legKey(at.to, ends[0].from));
    if (!home) return;
    best.cost = spent + home.cost;
    best.score = scoreOf(metres + (home.real ?? home.cost), best.cost);
    best.order = chosen;
  };

  // The first fragment is fixed and unflipped: a loop has no beginning, so
  // every order that differs only by where it starts is the same lap, and
  // fixing it divides the search by twelve.
  //
  // Eleven rather than eight because of the greedy lap above: Jeddah, Miami and
  // Madrid all arrive with nine or more fragments, and all three used to fall
  // through to the angular guess, which is the one that leaves a lap turning
  // through nought.
  const searchable = runs.length <= 11;
  if (searchable) {
    greedy();
    walk([ends[0]], 0, runLen.get(ends[0].run), runs.slice(1));
  }

  /**
   * The fallback, for a circuit that arrives in more pieces than can be priced:
   * the order the fragments sit round the loop, by the angle of each one's
   * middle about the middle of them all.
   */
  const heart = { x: 0, z: 0 };
  for (const run of runs) for (const id of run.nodes) {
    const p = nodes.get(id);
    heart.x += p.x / run.nodes.length / runs.length;
    heart.z += p.z / run.nodes.length / runs.length;
  }
  const angle = (run) => {
    const p = nodes.get(run.nodes[Math.floor(run.nodes.length / 2)]);
    return Math.atan2(p.z - heart.z, p.x - heart.x);
  };

  if (process.env.TSP) {
    process.stderr.write(`\n  TSP runs=${runs.length} ends=${ends.length} legs=${legs.size}`
      + ` searchable=${searchable} score=${best.score.toFixed(0)}`
      + ` order=${best.order ? best.order.length : 'null'}\n`);
  }
  const order = best.order || [...runs]
    .sort((a, b) => angle(a) - angle(b))
    .map((run) => ends.find((e) => e.run === run && !e.flip));

  /**
   * The order decided, the legs driven again one at a time.
   *
   * The table above prices every leg against the fragments alone, which is what
   * makes comparing forty-six thousand laps affordable - but it means two legs
   * are priced without knowing about each other, and with two fragments there is
   * only one order, so Las Vegas took the same road out and back and eighty-nine
   * per cent of the lap lay on top of itself.
   *
   * So the table chooses the order and then the legs are driven in that order,
   * each one told where the ones before it went. It costs one more search per
   * leg, which is nothing next to the table.
   */
  const drive = { ids: new Set(taken.ids), tunnel: taken.tunnel, grid: new Map(),
    key: taken.key, has: taken.has, add: taken.add, near: taken.near };
  for (const [k, v] of taken.grid) drive.grid.set(k, [...v]);

  const lap = [];
  let driven = 0;
  let forced = 0;
  for (let i = 0; i < order.length; i++) {
    const here = order[i];
    const ns = here.flip ? [...here.run.nodes].reverse() : here.run.nodes;
    if (i === 0) lap.push(...ns);
    else lap.push(...ns.slice(1));
    const next = order[(i + 1) % order.length];
    let path = shortest(links, here.to, next.from, drive);
    if (!path) {
      path = legs.get(legKey(here.to, next.from))?.path;
      if (path) forced++;
    }
    if (!path) {
      forced++;
      continue;
    }
    lap.push(...path.slice(1, -1));
    for (const id of path) drive.add(id);
    driven += lengthOf(path);
  }
  return { lap, driven, stranded: 0, forced, searched: searchable };
}

/** The lap in metres, at a fixed spacing, carrying the tunnel flag along. */
function resample(points, step) {
  const n = points.length;
  const run = [0];
  for (let i = 1; i <= n; i++) {
    run.push(run[i - 1] + dist(points[i - 1], points[i % n]));
  }
  const total = run[n];
  const count = Math.max(60, Math.round(total / step));
  const out = [];
  let at = 0;
  for (let i = 0; i < count; i++) {
    const want = (i * total) / count;
    while (at < n - 1 && run[at + 1] < want) at++;
    const span = run[at + 1] - run[at] || 1;
    const t = (want - run[at]) / span;
    const a = points[at];
    const b = points[(at + 1) % n];
    out.push({
      x: a.x + (b.x - a.x) * t,
      z: a.z + (b.z - a.z) * t,
      // A point is in the tunnel if the piece of road it sits on is.
      tunnel: (t < 0.5 ? a.tunnel : b.tunnel) ? 1 : 0,
    });
  }
  return { out, total };
}

// --- What is beside the road --------------------------------------------------

/**
 * A building, as the four numbers this game can draw one with.
 *
 * The footprint is reduced to its bounding box in the direction it is longest,
 * which for a building on a street is the direction of the street: an L-shaped
 * block becomes one box the size of the L, and at this resolution and this speed
 * that is a building. Height comes from the `height` tag where there is one, from
 * `building:levels` times three where there is not, and from a guess where there
 * is neither - and the guess is deliberately low, because a wrong tall building
 * is a wall across the view and a wrong short one is scenery.
 */
function boxOf(way, project) {
  const pts = way.g.map((p) => project(p.lat, p.lon));
  let cx = 0;
  let cz = 0;
  for (const p of pts) {
    cx += p.x / pts.length;
    cz += p.z / pts.length;
  }
  // The longest edge decides which way the building faces.
  let best = 0;
  let facing = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const dx = pts[i + 1].x - pts[i].x;
    const dz = pts[i + 1].z - pts[i].z;
    const len = Math.hypot(dx, dz);
    if (len > best) {
      best = len;
      facing = Math.atan2(dx, dz);
    }
  }
  const co = Math.cos(-facing);
  const si = Math.sin(-facing);
  let wide = 0;
  let deep = 0;
  for (const p of pts) {
    const x = (p.x - cx) * co - (p.z - cz) * si;
    const z = (p.x - cx) * si + (p.z - cz) * co;
    wide = Math.max(wide, Math.abs(x));
    deep = Math.max(deep, Math.abs(z));
  }
  const t = way.tags;
  const tall = Number.parseFloat(t.height)
    || (Number.parseFloat(t['building:levels']) || 0) * 3.2
    || 9;
  return { x: cx, z: cz, w: Math.max(3, wide), d: Math.max(3, deep), h: tall, r: facing };
}

/** The middle of a body of water, and how big it is. */
function poolOf(way, project) {
  const pts = way.g.map((p) => project(p.lat, p.lon));
  let cx = 0;
  let cz = 0;
  for (const p of pts) {
    cx += p.x / pts.length;
    cz += p.z / pts.length;
  }
  let reach = 0;
  for (const p of pts) reach = Math.max(reach, Math.hypot(p.x - cx, p.z - cz));
  return { x: cx, z: cz, reach, pts };
}

/** Is this point inside the ring? Even-odd, which is all a harbour needs. */
function inside(pts, x, z) {
  let hit = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const a = pts[i];
    const b = pts[j];
    if ((a.z > z) !== (b.z > z)
      && x < ((b.x - a.x) * (z - a.z)) / (b.z - a.z) + a.x) hit = !hit;
  }
  return hit;
}

// --- How high it is -----------------------------------------------------------

/**
 * Real heights, from a terrain model, smoothed until they are a road again.
 *
 * The raw numbers are a thirty metre grid sampled at points that are ten metres
 * apart, so consecutive readings often come from the same cell and then jump a
 * whole metre to the next one. That is a staircase, and a car driven over it
 * shakes itself apart. It is also wrong in a specific way: a road cut into a
 * hillside is not the hillside, and the model only knows the hillside.
 *
 * Smoothed over a couple of hundred metres both faults go and what is left is
 * the thing that was actually wanted - where the circuit climbs and by how much.
 * Monaco comes out with forty-two metres between the harbour and Casino, which
 * is what Monaco has.
 */
async function heightsFor(points, lat0, lon0) {
  const R = 6371000;
  const k = Math.cos((lat0 * Math.PI) / 180);
  const back = (p) => ({
    lat: lat0 + (p.z / R) * 180 / Math.PI,
    lon: lon0 + (p.x / (R * k)) * 180 / Math.PI,
  });
  const raw = [];
  const BATCH = 100;
  // Whichever service answered last time is asked first this time, so a run does
  // not rediscover the same rate limit sixty times.
  let source = 0;
  for (let i = 0; i < points.length; i += BATCH) {
    const slice = points.slice(i, i + BATCH).map(back);
    let got = null;
    for (let tried = 0; tried < ELEVATION.length * 2 && !got; tried++) {
      const service = ELEVATION[source % ELEVATION.length];
      const res = await fetch(service.url(slice), {
        headers: { 'User-Agent': 'webtrack-circuit-import/1.0' },
      });
      if (res.ok) {
        const body = await res.json();
        if (!body.error) got = service.read(body);
      }
      if (!got) {
        source++;
        await new Promise((r) => setTimeout(r, 2000));
      }
    }
    if (!got) throw new Error('both elevation services said no');
    raw.push(...got);
    await new Promise((r) => setTimeout(r, 1100));
  }
  // Smoothed round the lap, so there is no seam at the start line, and over a
  // fixed distance rather than a fixed share of it.
  //
  // The noise is at the terrain model's own scale - thirty metres - so that is
  // what the smoothing has to be measured against. Set to a fraction of the lap
  // instead, it took Monaco's climb from forty-one metres to twenty: the harbour
  // to Casino is four hundred metres of it, and a hundred and eighty metres of
  // smoothing is most of the way to flattening that.
  const n = raw.length;
  const span = Math.max(3, Math.round(60 / STORE));
  const out = new Array(n);
  for (let i = 0; i < n; i++) {
    let sum = 0;
    for (let d = -span; d <= span; d++) sum += raw[((i + d) % n + n) % n];
    out[i] = sum / (span * 2 + 1);
  }
  const base = Math.min(...out);
  return { heights: out.map((h) => h - base), raw };
}

// --- Doing it -----------------------------------------------------------------

/** Base-36 deltas, the same shape tools/import-circuit.js emits. */
function pack(values, scale) {
  let prev = 0;
  return values.map((v) => {
    const now = Math.round(v * scale);
    const d = now - prev;
    prev = now;
    return d.toString(36);
  }).join(' ');
}

const STORE = 10;

async function build(key) {
  const circuit = CIRCUITS[key];
  if (!circuit) throw new Error(`no circuit called ${key}`);
  process.stderr.write(`${key}: fetching… `);
  const { nodes, ways } = await fetchRoads(circuit);

  let members = null;
  if (circuit.relation) {
    // The relation's own ways, which Overpass returned alongside everything else.
    members = new Set(ways.filter((w) => (w.tags || {}).highway === 'raceway').map((w) => w.id));
  }
  const mine = ways.filter((w) => isCircuit(w, circuit, members));
  const streets = ways.filter((w) => (w.tags || {}).highway);
  const lat0 = circuit.box[0] / 2 + circuit.box[2] / 2;
  const lon0 = circuit.box[1] / 2 + circuit.box[3] / 2;
  const project = projector(lat0, lon0);

  const inTunnel = tunnelNodes(ways);
  const runs = chain(mine);
  const links = graphOf(streets, nodes, project);
  const { lap, driven, stranded, forced } = assemble(runs, links, nodes, project, inTunnel,
    circuit.metres);

  const points = lap
    .filter((n) => nodes.has(n))
    .map((n) => {
      const p = nodes.get(n);
      const at = project(p.lat, p.lon);
      at.tunnel = inTunnel.has(n);
      return at;
    });
  let { out, total } = resample(points, STORE);

  // Round the right way. A closed loop turns through exactly two pi, and the
  // sign of it says which way: Monaco assembled anticlockwise, and Monaco is
  // not an anticlockwise circuit.
  if (circuit.clockwise !== undefined) {
    let turn = 0;
    const n = out.length;
    for (let i = 0; i < n; i++) {
      const a = out[(i - 1 + n) % n];
      const b = out[i];
      const c = out[(i + 1) % n];
      let d = Math.atan2(c.x - b.x, c.z - b.z) - Math.atan2(b.x - a.x, b.z - a.z);
      while (d > Math.PI) d -= Math.PI * 2;
      while (d < -Math.PI) d += Math.PI * 2;
      turn += d;
    }
    if ((turn > 0) !== circuit.clockwise) out = out.reverse();
  }
  // How much of the lap lies on top of the rest of it. A closed circuit does
  // not, except in a tunnel, and this is the number that says whether the
  // routing worked.
  let overlap = 0;
  for (let i = 0; i < out.length; i++) {
    for (let j = 0; j < out.length; j++) {
      const apart = Math.min(Math.abs(i - j), out.length - Math.abs(i - j));
      if (apart < 25) continue;
      if (Math.hypot(out[i].x - out[j].x, out[i].z - out[j].z) < 12
        && !out[i].tunnel && !out[j].tunnel) {
        overlap++;
        break;
      }
    }
  }
  let turn = 0;
  for (let i = 0; i < out.length; i++) {
    const a = out[(i - 1 + out.length) % out.length];
    const b = out[i];
    const c = out[(i + 1) % out.length];
    let d = Math.atan2(c.x - b.x, c.z - b.z) - Math.atan2(b.x - a.x, b.z - a.z);
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    turn += d;
  }
  process.stderr.write(`${(total / 1000).toFixed(3)} km `
    + `(${Math.round((total / circuit.metres) * 100)}% of ${circuit.metres} m), `
    + `${runs.length} fragments, ${Math.round(driven)} m driven, `
    + `${forced} forced, turn ${(turn / Math.PI).toFixed(2)}pi, `
    + `${Math.round((overlap / out.length) * 100)}% doubled, `
    + `${out.filter((p) => p.tunnel).length} in tunnel… `);

  const { heights } = await heightsFor(out, lat0, lon0);
  const climb = Math.max(...heights) - Math.min(...heights);
  process.stderr.write(`${climb.toFixed(0)} m of climb, `);

  // --- and what stands beside it ---
  const scene = await fetchScenery(circuit);
  /** The nearest node of the lap, and which side of it something is on. */
  const place = (x, z) => {
    let best = null;
    for (let i = 0; i < out.length; i++) {
      const d = Math.hypot(x - out[i].x, z - out[i].z);
      if (!best || d < best.d) best = { i, d };
    }
    const a = out[best.i];
    const b = out[(best.i + 1) % out.length];
    // The track's right-hand vector, to decide which side of the road it is on.
    const len = Math.hypot(b.x - a.x, b.z - a.z) || 1;
    const nx = (b.z - a.z) / len;
    const nz = -(b.x - a.x) / len;
    const side = (x - a.x) * nx + (z - a.z) * nz >= 0 ? 1 : -1;
    return { at: best.i, off: best.d, side, heading: Math.atan2(b.x - a.x, b.z - a.z) };
  };

  const REACH = 190;
  const buildings = [];
  for (const w of scene.buildings) {
    const b = boxOf(w, project);
    const p = place(b.x, b.z);
    if (p.off > REACH) continue;
    // Nothing standing where the road is.
    if (p.off < 11) continue;
    buildings.push({
      at: p.at, side: p.side, off: Math.round(p.off * 10) / 10,
      w: Math.round(b.w), d: Math.round(b.d), h: Math.round(b.h),
      // Turned relative to the track, because that is what the renderer works in.
      r: Math.round((b.r - p.heading) * 100) / 100,
    });
  }

  /**
   * Boats, moored where boats are moored: along the piers.
   *
   * Scattered at random inside the water polygon first, which put eight of them
   * in the middle of Port Hercule and none of them anywhere a boat would
   * actually be. A harbour is not a lake with boats in it - it is a set of
   * quays and pontoons with boats lying alongside them, and OpenStreetMap has
   * every one of those as `man_made=pier`. Forty-one of them at Monaco.
   *
   * So a boat is put every twenty-two metres along each pier, a few metres off
   * to the side, facing across it - which is a marina, and takes no deciding.
   */
  const boats = [];
  const rnd = (() => {
    let seed = 0x2f6e;
    return () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };
  })();
  for (const w of scene.piers) {
    const pts = w.g.map((p) => project(p.lat, p.lon));
    let run = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i];
      const b = pts[i + 1];
      const len = dist(a, b);
      const nx = (b.z - a.z) / (len || 1);
      const nz = -(b.x - a.x) / (len || 1);
      for (let along = 0; along < len; along += 1) {
        run += 1;
        if (run < 22) continue;
        run = 0;
        const t = along / (len || 1);
        // Alternating sides, because a pontoon has boats on both of them.
        const out = (boats.length % 2 ? 1 : -1) * (7 + rnd() * 5);
        const x = a.x + (b.x - a.x) * t + nx * out;
        const z = a.z + (b.z - a.z) * t + nz * out;
        const p = place(x, z);
        if (p.off > 340 || p.off < 22) continue;
        if (boats.some((o) => Math.hypot(o.x - x, o.z - z) < 15)) continue;
        boats.push({
          x, z, at: p.at, side: p.side, off: Math.round(p.off * 10) / 10,
          s: Math.round((1.5 + rnd() * 2.4) * 10) / 10,
          // Bow on to the pier, which is how they are parked.
          r: Math.round((Math.atan2(nx, nz) - p.heading) * 100) / 100,
        });
        if (boats.length >= 90) break;
      }
      if (boats.length >= 90) break;
    }
    if (boats.length >= 90) break;
  }
  process.stderr.write(`${buildings.length} buildings, ${boats.length} boats\n`);

  return {
    key,
    metres: total,
    line: pack(out.flatMap((p) => [p.x, p.z]), 10),
    height: pack(heights, 10),
    // One character a point: the cheapest way to say yes or no six hundred times.
    tunnel: out.map((p) => (p.tunnel ? '1' : '0')).join(''),
    buildings,
    boats: boats.map(({ x, z, ...rest }) => rest),
    found: total / circuit.metres,
    stranded,
  };
}

const asked = process.argv[2];
if (asked) {
  const keys = asked === 'all' ? Object.keys(CIRCUITS) : [asked];
  const done = [];
  for (const key of keys) {
    try {
      done.push(await build(key));
    } catch (err) {
      process.stderr.write(`${key}: ${err.message}\n`);
    }
  }
  writeFileSync('osm-circuits.json', JSON.stringify(done, null, 1));
  process.stderr.write(`\nwrote osm-circuits.json with ${done.length} of ${keys.length}\n`);
}

export {
  CIRCUITS, overpass, projector, dist, ELEVATION,
  fetchRoads, isCircuit, chain, tunnelNodes, graphOf, shortest,
  assemble, resample, heightsFor, build,
};
