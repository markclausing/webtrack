// One model, on its own, from three sides.
//
//   node tools/modelshot.js               # the car
//   node tools/modelshot.js --prop=stand  # a grandstand
//   node tools/modelshot.js --team=3 --steer=1
//
// Writes shots/model.png and prints the triangle count. It is tools/modelview.html
// photographed, and it exists because the camera in the game sits eight metres
// behind the car and slightly above and never anywhere else - which is one of
// the angles a model has. Working on a wheel through the game means driving to
// Monaco to look at it.

import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch, open, sleep } from './browser.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.PORT) || 8080;

const args = new URLSearchParams();
for (const arg of process.argv.slice(2)) {
  const m = /^--([a-z]+)=(.*)$/.exec(arg);
  if (m) args.set(m[1], m[2]);
}

await launch({ width: 1920, height: 560 });
const page = await open(`http://localhost:${PORT}/tools/modelview.html?${args}`,
  { width: 1920, height: 560 });
if (!await page.ready(30)) {
  console.error('the model page never became ready');
  for (const line of page.logs.slice(0, 5)) console.error(` ${line.level}: ${line.text}`);
  process.exit(1);
}
await sleep(200);
mkdirSync(path.join(ROOT, 'shots'), { recursive: true });
const file = path.join(ROOT, 'shots', `model-${args.get('prop') || 'car'}.png`);
writeFileSync(file, await page.screenshot());
console.log(`${path.relative(ROOT, file)}  ${await page.evaluate('document.getElementById("count").textContent')}`);
for (const line of page.logs.filter((l) => l.level === 'error').slice(0, 3)) {
  console.error(` error: ${line.text.slice(0, 200)}`);
}
await page.close();
process.exit(0);
