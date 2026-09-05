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

import { writeFileSync } from 'node:fs';

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
  const res = await fetch(OVERPASS, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'webtrack-circuit-import/1.0 (https://github.com/markclausing/webtrack)',
    },
    body: `data=${encodeURIComponent(query)}`,
  });
  if (!res.ok) throw new Error(`overpass ${res.status}`);
  return res.json();
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
);
out geom;`;
  const data = await overpass(query);
  const buildings = [];
  const water = [];
  for (const e of data.elements) {
    const g = e.geometry;
    if (!g || g.length < 3) continue;
    const t = e.tags || {};
    if (t.building) buildings.push({ g, tags: t });
    else water.push({ g, tags: t });
  }
  return { buildings, water };
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
  if (members && members.has(way.id)) return true;
  if (t.highway !== 'raceway') return false;
  // Pit lanes, pit entries, penalty loops and alternative layouts are all
  // tagged raceway and none of them is the lap.
  const name = `${t.name || ''}`.toLowerCase();
  if (/pit|stands|paddock|box|penalty|entry|exit|drag|karting|oval|inner|outer/.test(name)) {
    return false;
  }
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

/** Dijkstra, because the graphs are small and the answer has to be the road. */
function shortest(links, from, to) {
  const seen = new Map([[from, 0]]);
  const back = new Map();
  const queue = [[0, from]];
  while (queue.length) {
    queue.sort((a, b) => a[0] - b[0]);
    const [cost, at] = queue.shift();
    if (at === to) break;
    if (cost > (seen.get(at) ?? Infinity)) continue;
    for (const [next, w] of links.get(at) || []) {
      const c = cost + w;
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
function assemble(runs, links, nodes, project) {
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
   * The fragments in the order the circuit visits them, which is round.
   *
   * Taking the nearest reachable one each time is the obvious thing and it is
   * wrong: two fragments can be close together and still be visited an entire
   * lap apart, so the route doubles back and Monaco came out nineteen per cent
   * too long. A closed circuit puts its fragments in a ring, so they are sorted
   * by the angle of their middle about the middle of everything - which is what
   * "in order" means on a loop.
   */
  const mid = (ns) => {
    const p = nodes.get(ns[Math.floor(ns.length / 2)]);
    return project(p.lat, p.lon);
  };
  const centre = { x: 0, z: 0 };
  for (const r of runs) {
    const m = mid(r.nodes);
    centre.x += m.x / runs.length;
    centre.z += m.z / runs.length;
  }
  const angle = (r) => {
    const m = mid(r.nodes);
    return Math.atan2(m.z - centre.z, m.x - centre.x);
  };
  // If the fragments already make one closed loop there is nothing to drive:
  // a permanent circuit is mapped end to end and routing it through the streets
  // would only find a way to make it longer.
  if (runs.length === 1 && runs[0].nodes[0] === runs[0].nodes[runs[0].nodes.length - 1]) {
    return { lap: runs[0].nodes.slice(0, -1), driven: 0, stranded: 0 };
  }

  const ring = [...runs].sort((a, b) => angle(a) - angle(b));
  const left = ring.slice(1);
  const lap = [...ring[0].nodes];
  let driven = 0;

  while (left.length) {
    const head = lap[lap.length - 1];
    let best = null;
    // The next one round the ring, taken either way about - a fragment's stored
    // direction is whichever way it happened to be drawn.
    const next = left.shift();
    for (const flip of [false, true]) {
      const ns = flip ? [...next.nodes].reverse() : next.nodes;
      const path = shortest(links, head, ns[0]);
      if (!path) continue;
      const cost = lengthOf(path);
      if (!best || cost < best.cost) best = { ns, path, cost };
    }
    if (!best) continue;
    lap.push(...best.path.slice(1), ...best.ns.slice(1));
    driven += best.cost;
  }

  // And home, so the lap closes.
  const home = shortest(links, lap[lap.length - 1], lap[0]);
  if (home) {
    lap.push(...home.slice(1, -1));
    driven += lengthOf(home);
  }
  return { lap, driven, stranded: left.length };
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
  const { lap, driven, stranded } = assemble(runs, links, nodes, project);

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
  process.stderr.write(`${(total / 1000).toFixed(3)} km `
    + `(${Math.round((total / circuit.metres) * 100)}% of ${circuit.metres} m), `
    + `${runs.length} fragments, ${Math.round(driven)} m driven, `
    + `${out.filter((p) => p.tunnel).length} points in tunnel… `);

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

  // Boats, moored in whatever water there is beside the circuit. At Monaco that
  // is Port Hercule and it is the reason anybody recognises the place.
  const boats = [];
  for (const w of scene.water) {
    const pool = poolOf(w, project);
    if (pool.reach < 40) continue;
    const rnd = (() => { let seed = 0x2f6e; return () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    }; })();
    for (let tries = 0; tries < 3000 && boats.length < 80; tries++) {
      const x = pool.x + (rnd() * 2 - 1) * pool.reach;
      const z = pool.z + (rnd() * 2 - 1) * pool.reach;
      if (!inside(pool.pts, x, z)) continue;
      const p = place(x, z);
      // Further out than a building may stand: a harbour is wide, and the far
      // side of Port Hercule is three hundred metres from the road.
      if (p.off > 340 || p.off < 24) continue;
      if (boats.some((o) => Math.hypot(o.x - x, o.z - z) < 19)) continue;
      boats.push({
        x, z, at: p.at, side: p.side, off: Math.round(p.off * 10) / 10,
        // Big ones nearer the quay, which is how a harbour is arranged.
        s: Math.round((1.4 + rnd() * 2.6) * 10) / 10,
        r: Math.round((rnd() * 6.28 - p.heading) * 100) / 100,
      });
    }
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
