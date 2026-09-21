// Renders the link-preview images (WhatsApp, Facebook, X) with headless Chrome:
// assets/og-or.png and assets/og-en.png, 1200×630. Re-run only if the design changes.
//   node scripts/og.mjs
import { writeFileSync, mkdtempSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const out = lang => new URL(`../assets/og-${lang}.png`, import.meta.url).pathname;

const T = {
  or: {
    title: 'ଓଡ଼ିଆ ପର୍ବପର୍ବାଣି',
    sub: 'ସବୁ ଓଡ଼ିଆ ପର୍ବ ଆପଣଙ୍କ ଗୁଗୁଲ କ୍ୟାଲେଣ୍ଡରରେ',
    cta: 'ମାଗଣା · ଗୋଟିଏ ଟ୍ୟାପରେ ଯୋଡ଼ନ୍ତୁ',
    font: "'Noto Sans Oriya'",
  },
  en: {
    title: 'Odia Festival Calendar',
    sub: 'Every Odia festival in your Google Calendar',
    cta: 'Free · Add it in one tap',
    font: "'Noto Sans'",
  },
};
// The calendar mock shows real Odia chips in both versions, as the widget does.
const chips = [
  ['ରଜ', 3], ['ରଥଯାତ୍ରା', 9], ['କୁମାର ପୂର୍ଣ୍ଣିମା', 12], ['ମାଣବସା ଗୁରୁବାର', 18], ['ନୂଆଖାଇ', 23], ['ବୋଇତ ବନ୍ଦାଣ', 27],
];

const html = t => `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Baloo+Bhaina+2:wght@700&family=Noto+Sans:wght@500;700&family=Noto+Sans+Oriya:wght@500;700&display=block" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; }
  body { width: 1200px; height: 630px; overflow: hidden; background: #FBF6EE; color: #2B1B17;
         font-family: ${t.font}, sans-serif; display: flex; align-items: center; padding: 0 72px; gap: 56px; }
  .text { flex: 1; }
  h1 { font: 700 ${t === T.or ? 96 : 76}px/1.1 'Baloo Bhaina 2', ${t.font}, sans-serif; }
  p { font-size: 34px; font-weight: 500; color: #6B5A52; margin-top: 22px; line-height: 1.35; }
  .cta { display: inline-block; margin-top: 38px; background: #C2410C; color: #fff; font-weight: 700;
         font-size: 30px; padding: 14px 30px; border-radius: 18px; }
  .cal { width: 400px; flex: none; background: #fff; border: 2px solid #EADFD2; border-radius: 28px; padding: 22px;
         box-shadow: 0 12px 40px rgba(43,27,23,.10); display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
  .d { height: 74px; border-radius: 10px; background: #FBF6EE; padding: 6px; font: 600 15px 'Noto Sans', sans-serif; color: #6B5A52; position: relative; }
  .d span { position: absolute; left: 4px; right: 4px; bottom: 6px; background: #C2410C; color: #fff; border-radius: 6px;
            font: 600 13px 'Noto Sans Oriya', sans-serif; padding: 2px 5px; white-space: nowrap; overflow: hidden; }
</style></head><body>
  <div class="text"><h1>${t.title}</h1><p>${t.sub}</p><div class="cta">${t.cta}</div></div>
  <div class="cal">${Array.from({ length: 30 }, (_, i) => {
    const c = chips.find(([, day]) => day === i + 1);
    return `<div class="d">${i + 1}${c ? `<span>${c[0]}</span>` : ''}</div>`;
  }).join('')}</div>
</body></html>`;

const dir = mkdtempSync(join(tmpdir(), 'og-'));
for (const [lang, t] of Object.entries(T)) {
  const file = join(dir, `${lang}.html`);
  writeFileSync(file, html(t));
  execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
    '--window-size=1200,630', '--virtual-time-budget=10000', `--screenshot=${out(lang)}`, `file://${file}`], { stdio: 'ignore' });
  console.log(`wrote assets/og-${lang}.png`);
}
