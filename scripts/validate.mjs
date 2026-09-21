// Checks festivals.json before it's pushed: the calendar sync trusts this file.
// Usage: node scripts/validate.mjs   (exit 1 with a list of problems if any)
import { readFileSync } from 'node:fs';

const file = new URL('../festivals.json', import.meta.url);
const list = JSON.parse(readFileSync(file, 'utf8'));
const problems = [];
const seen = new Set();
let prev = '';

if (!Array.isArray(list) || list.length < 20) problems.push('expected an array of at least 20 festivals');

for (const [i, f] of list.entries()) {
  const at = `#${i + 1} ${f.date} ${f.title}`;
  for (const k of ['date', 'title', 'odia', 'description', 'status', 'source']) {
    if (typeof f[k] !== 'string' || !f[k].trim()) problems.push(`${at}: missing ${k}`);
  }
  const d = new Date(`${f.date}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(f.date) || isNaN(d) || d.toISOString().slice(0, 10) !== f.date) {
    problems.push(`${at}: not a real date`);
    continue;
  }
  if (!['confirmed', 'tentative'].includes(f.status)) problems.push(`${at}: status must be confirmed or tentative`);
  if (f.date < prev) problems.push(`${at}: out of date order`);
  prev = f.date;

  const key = `${f.date}|${f.odia.split(' / ')[0]}`; // what the calendar sync matches on
  if (seen.has(key)) problems.push(`${at}: duplicate Odia title on the same day`);
  seen.add(key);

  const weekday = d.getUTCDay();
  if (f.title === 'Manabasa Gurubar' && weekday !== 4) problems.push(`${at}: Manabasa Gurubar must be a Thursday`);
  if (f.title === 'Khudurukuni Osha' && weekday !== 0) problems.push(`${at}: Khudurukuni Osha must be a Sunday`);
}

if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log(`festivals.json OK: ${list.length} festivals, ` +
  `${list.filter(f => f.status === 'confirmed').length} confirmed, through ${prev}.`);
